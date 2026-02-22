'use strict';

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const DATA_DIR = path.join(__dirname, '..', 'data');
const OUTPUT_DIR = path.join(__dirname, '..', 'public');

// js-yaml may parse unquoted YYYY-MM-DD values as Date objects
function toDateString(val) {
  if (val instanceof Date) return val.toISOString().slice(0, 10);
  return String(val);
}

function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Swedish weekday + date formatting without locale dependency
const WEEKDAYS_SV = ['söndag', 'måndag', 'tisdag', 'onsdag', 'torsdag', 'fredag', 'lördag'];
const MONTHS_SV = [
  'januari', 'februari', 'mars', 'april', 'maj', 'juni',
  'juli', 'augusti', 'september', 'oktober', 'november', 'december',
];

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  const weekday = WEEKDAYS_SV[d.getDay()];
  const day = d.getDate();
  const month = MONTHS_SV[d.getMonth()];
  const year = d.getFullYear();
  return `${weekday} ${day} ${month} ${year}`;
}

// ── Load camps registry ──────────────────────────────────────────────────────

const campsFile = path.join(DATA_DIR, 'camps.yaml');
if (!fs.existsSync(campsFile)) {
  console.error('ERROR: data/camps.yaml not found');
  process.exit(1);
}

const campsData = yaml.load(fs.readFileSync(campsFile, 'utf8'));
const camps = campsData.camps;

let activeCamp = camps.find((c) => c.active === true);
if (!activeCamp) {
  const sorted = [...camps].sort((a, b) =>
    toDateString(b.start_date).localeCompare(toDateString(a.start_date)),
  );
  activeCamp = sorted[0];
  console.log(`No active camp – using most recent: ${activeCamp.name}`);
} else {
  console.log(`Active camp: ${activeCamp.name}`);
}

// ── Load camp file ───────────────────────────────────────────────────────────

const campFilePath = path.join(DATA_DIR, activeCamp.file);
if (!fs.existsSync(campFilePath)) {
  console.error(`ERROR: camp file not found: ${activeCamp.file}`);
  process.exit(1);
}

const campData = yaml.load(fs.readFileSync(campFilePath, 'utf8'));
const camp = campData.camp;
const events = campData.events || [];

// ── Group and sort ───────────────────────────────────────────────────────────

const byDate = {};
for (const event of events) {
  const d = toDateString(event.date);
  if (!byDate[d]) byDate[d] = [];
  byDate[d].push(event);
}

const dates = Object.keys(byDate).sort();
for (const d of dates) {
  byDate[d].sort((a, b) => String(a.start).localeCompare(String(b.start)));
}

// ── Render HTML ──────────────────────────────────────────────────────────────

function eventExtraHtml(e) {
  const parts = [];
  if (e.description) {
    e.description.trim().split(/\n\n+/).forEach((p) =>
      parts.push(`<p class="event-desc">${escapeHtml(p.trim())}</p>`),
    );
  }
  if (e.link) {
    parts.push(`<a class="event-ext-link" href="${escapeHtml(String(e.link))}" target="_blank" rel="noopener">Extern länk →</a>`);
  }
  return `<div class="event-extra">${parts.join('')}</div>`;
}

const daySections = dates.map((date) => {
  const dayEvents = byDate[date];

  const rows = dayEvents.map((e) => {
    const timeStr = e.end
      ? `${escapeHtml(String(e.start))}–${escapeHtml(String(e.end))}`
      : escapeHtml(String(e.start));
    const metaParts = [e.location, e.responsible].filter(Boolean).map(escapeHtml);
    const metaEl = metaParts.length
      ? `<span class="ev-meta"> · ${metaParts.join(' · ')}</span>`
      : '';
    const hasExtra = e.description || e.link;

    if (hasExtra) {
      return [
        '    <details class="event-row">',
        '      <summary>',
        `        <span class="ev-time">${timeStr}</span>`,
        `        <span class="ev-title">${escapeHtml(e.title)}</span>`,
        metaEl ? `        ${metaEl}` : '',
        '      </summary>',
        `      ${eventExtraHtml(e)}`,
        '    </details>',
      ].filter(Boolean).join('\n');
    } else {
      return [
        '    <div class="event-row plain">',
        `      <span class="ev-time">${timeStr}</span>`,
        `      <span class="ev-title">${escapeHtml(e.title)}</span>`,
        metaEl ? `      ${metaEl}` : '',
        '    </div>',
      ].filter(Boolean).join('\n');
    }
  }).join('\n');

  return [
    `  <details class="day" id="${date}" open>`,
    `    <summary>${formatDate(date)}</summary>`,
    '    <div class="event-list">',
    rows,
    '    </div>',
    '  </details>',
  ].join('\n');
}).join('\n\n');

const campName = escapeHtml(camp.name);

const html = `<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Schema – ${campName}</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <h1>Schema – ${campName}</h1>
  <p class="intro">Om du klickar på en aktivitets rubrik så finns det ofta lite mer detaljerad information. När plats säger [annat], då ska platsen stå i den detaljerade informationen.</p>
  <p class="intro">Lägret blir vad vi gör det till tillsammans, alla aktiviteter är deltagararrangerade. Känner man att det är någon aktivitet som man vill arrangera och behöver material till den, det kan vara allt ifrån bakingredienser till microbitar att programmera, kort sagt vad behöver ni som aktivitetsarrangör för att kunna hålla eran aktivitet? Kolla under "Lägg till aktivitet".</p>

${daySections}
</body>
</html>
`;

// ── Write output ─────────────────────────────────────────────────────────────

fs.mkdirSync(OUTPUT_DIR, { recursive: true });
fs.writeFileSync(path.join(OUTPUT_DIR, 'schema.html'), html, 'utf8');

console.log(
  `Built: public/schema.html  (${dates.length} days, ${events.length} events)`,
);
