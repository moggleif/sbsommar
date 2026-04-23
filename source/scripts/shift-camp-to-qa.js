#!/usr/bin/env node
'use strict';

// Tool: copies a camp's events into source/data/qa-thisweek.yaml with dates
// shifted so the camp starts on a given anchor date. Intended for manual
// testing — lets developers populate the QA camp with real-shaped data
// (copied from an archived camp) aligned to today's calendar.
//
// Usage:
//   node source/scripts/shift-camp-to-qa.js \
//     --source 2025-06-syssleback.yaml \
//     --anchor 2026-04-24
//
// The script:
//   - Parses the source per-camp YAML file.
//   - Shifts every event.date and every event.id's embedded date by the
//     number of days between source camp's start_date and --anchor.
//   - Rewrites qa-thisweek.yaml with the shifted events, keeping the QA
//     camp metadata (id, name, location) intact.
//   - Updates source/data/camps.yaml so qa-thisweek's date range matches
//     the anchored source camp.
//
// The existing qa-thisweek.yaml content is overwritten. Revert via git.

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const DATA_DIR = path.join(__dirname, '..', 'data');

function parseArgs(argv) {
  const out = {};
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === '--source') out.source = argv[++i];
    else if (argv[i] === '--anchor') out.anchor = argv[++i];
  }
  if (!out.source || !out.anchor) {
    console.error('Usage: node shift-camp-to-qa.js --source <file.yaml> --anchor YYYY-MM-DD');
    process.exit(1);
  }
  return out;
}

function addDays(isoDate, days) {
  const d = new Date(`${isoDate}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function daysBetween(fromIso, toIso) {
  const a = new Date(`${fromIso}T00:00:00Z`).getTime();
  const b = new Date(`${toIso}T00:00:00Z`).getTime();
  return Math.round((b - a) / (24 * 60 * 60 * 1000));
}

function shiftEventId(id, shift) {
  // Event IDs are slug-YYYY-MM-DD-HHMM. Swap the date portion.
  const m = id.match(/^(.*)-(\d{4}-\d{2}-\d{2})-(\d{4})$/);
  if (!m) return id;
  const [, slug, date, hhmm] = m;
  return `${slug}-${addDays(date, shift)}-${hhmm}`;
}

function main() {
  const { source, anchor } = parseArgs(process.argv);
  const srcPath = path.join(DATA_DIR, source);
  const srcData = yaml.load(fs.readFileSync(srcPath, 'utf8'));
  const { camp: srcCamp, events: srcEvents } = srcData;

  const shift = daysBetween(srcCamp.start_date, anchor);
  const newStart = addDays(srcCamp.start_date, shift);
  const newEnd = addDays(srcCamp.end_date, shift);

  console.log(`Source camp: ${srcCamp.id} (${srcCamp.start_date}..${srcCamp.end_date})`);
  console.log(`Anchor:      ${anchor} — shift ${shift} day(s)`);
  console.log(`New range:   ${newStart}..${newEnd}`);
  console.log(`Events:      ${srcEvents.length}`);

  const newEvents = srcEvents.map((ev) => ({
    ...ev,
    id: shiftEventId(ev.id, shift),
    date: addDays(ev.date, shift),
    owner: ev.owner || { name: '', email: '' },
    meta: ev.meta || { created_at: '', updated_at: '' },
  }));

  const qaData = {
    camp: {
      id: 'qa-thisweek',
      name: 'QA Testläger (vår 2026)',
      location: 'Sysslebäck',
      start_date: newStart,
      end_date: newEnd,
    },
    events: newEvents,
  };

  const qaPath = path.join(DATA_DIR, 'qa-thisweek.yaml');
  fs.writeFileSync(qaPath, yaml.dump(qaData, { lineWidth: -1 }), 'utf8');
  console.log(`Wrote:       ${qaPath}`);

  // Update camps.yaml's qa-thisweek entry.
  const campsPath = path.join(DATA_DIR, 'camps.yaml');
  const campsRaw = fs.readFileSync(campsPath, 'utf8');
  const campsData = yaml.load(campsRaw);
  const entry = campsData.camps.find((c) => c.id === 'qa-thisweek');
  if (!entry) {
    console.error('ERROR: qa-thisweek entry not found in camps.yaml');
    process.exit(1);
  }
  entry.start_date = newStart;
  entry.end_date = newEnd;
  entry.opens_for_editing = addDays(newStart, -4);
  entry.registration_opens = addDays(newStart, -60);
  entry.registration_closes = addDays(newStart, -5);
  fs.writeFileSync(campsPath, yaml.dump(campsData, { lineWidth: -1 }), 'utf8');
  console.log(`Updated:     ${campsPath} (qa-thisweek metadata)`);
}

main();
