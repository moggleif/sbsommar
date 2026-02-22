'use strict';

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const { renderSchedulePage, toDateString } = require('./render');
const { renderAddPage } = require('./render-add');
const { renderIndexPage, convertMarkdown } = require('./render-index');

const DATA_DIR = path.join(__dirname, '..', 'data');
const CONTENT_DIR = path.join(__dirname, '..', 'content');
const OUTPUT_DIR = path.join(__dirname, '..', 'public');

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

// ── Load locations from local.yaml ───────────────────────────────────────────

const localFilePath = path.join(DATA_DIR, 'local.yaml');
if (!fs.existsSync(localFilePath)) {
  console.error('ERROR: data/local.yaml not found');
  process.exit(1);
}
const localData = yaml.load(fs.readFileSync(localFilePath, 'utf8'));
const locations = (localData.locations || []).map((l) => l.name);

// ── Render and write ─────────────────────────────────────────────────────────

fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const scheduleHtml = renderSchedulePage(camp, events);
fs.writeFileSync(path.join(OUTPUT_DIR, 'schema.html'), scheduleHtml, 'utf8');
console.log(`Built: public/schema.html  (${events.length} events)`);

const addHtml = renderAddPage(camp, locations);
fs.writeFileSync(path.join(OUTPUT_DIR, 'lagg-till.html'), addHtml, 'utf8');
console.log(`Built: public/lagg-till.html  (${locations.length} locations)`);

// ── Render index.html from all content/*.md files ────────────────────────
// index.md is first; all other files are sorted alphabetically after it.
// Headings in secondary files are shifted down one level (h1→h2, h2→h3)
// so the page has a single h1.

const mdFiles = fs.readdirSync(CONTENT_DIR).filter((f) => f.endsWith('.md')).sort();
const mdOrdered = ['index.md', ...mdFiles.filter((f) => f !== 'index.md')];

const bodyParts = mdOrdered
  .filter((f) => fs.existsSync(path.join(CONTENT_DIR, f)))
  .map((f, i) => {
    const md = fs.readFileSync(path.join(CONTENT_DIR, f), 'utf8');
    return convertMarkdown(md, i === 0 ? 0 : 1);
  });

const indexHtml = renderIndexPage(bodyParts.join('\n'));
fs.writeFileSync(path.join(OUTPUT_DIR, 'index.html'), indexHtml, 'utf8');
console.log(`Built: public/index.html  (${mdOrdered.length} sections)`);

// ── Copy content/images → public/images ──────────────────────────────────

const srcImages = path.join(CONTENT_DIR, 'images');
const destImages = path.join(OUTPUT_DIR, 'images');
if (fs.existsSync(srcImages)) {
  fs.mkdirSync(destImages, { recursive: true });
  let copied = 0;
  for (const file of fs.readdirSync(srcImages)) {
    fs.copyFileSync(path.join(srcImages, file), path.join(destImages, file));
    copied++;
  }
  console.log(`Copied: content/images → public/images  (${copied} files)`);
}
