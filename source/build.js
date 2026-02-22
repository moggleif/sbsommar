'use strict';

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const QRCode = require('qrcode');
const { renderSchedulePage, toDateString } = require('./render');
const { renderAddPage } = require('./render-add');
const { renderTodayPage } = require('./render-today');
const { renderIndexPage, convertMarkdown, extractHeroImage, extractH1 } = require('./render-index');

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

async function main() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const scheduleHtml = renderSchedulePage(camp, events);
  fs.writeFileSync(path.join(OUTPUT_DIR, 'schema.html'), scheduleHtml, 'utf8');
  console.log(`Built: public/schema.html  (${events.length} events)`);

  const qrSvg = (await QRCode.toString('https://sbsommar.se', { type: 'svg', margin: 2 }))
    .replace(/<\?xml[^?]*\?>\s*/g, '')
    .replace(/<!DOCTYPE[^>]*>\s*/g, '');

  const todayHtml = renderTodayPage(camp, events, qrSvg);
  fs.writeFileSync(path.join(OUTPUT_DIR, 'dagens-schema.html'), todayHtml, 'utf8');
  console.log(`Built: public/dagens-schema.html  (${events.length} events)`);

  const addHtml = renderAddPage(camp, locations);
  fs.writeFileSync(path.join(OUTPUT_DIR, 'lagg-till.html'), addHtml, 'utf8');
  console.log(`Built: public/lagg-till.html  (${locations.length} locations)`);

  // ── Render index.html from content/sections.yaml ─────────────────────────
  // Section order, IDs, and optional nav labels are defined in sections.yaml.
  // The first image in the first file is hoisted as the hero banner.

  const sectionsConfigPath = path.join(CONTENT_DIR, 'sections.yaml');
  if (!fs.existsSync(sectionsConfigPath)) {
    console.error('ERROR: content/sections.yaml not found');
    process.exit(1);
  }
  const sectionsConfig = yaml.load(fs.readFileSync(sectionsConfigPath, 'utf8'));

  let heroSrc = null;
  let heroAlt = null;

  const sections = sectionsConfig.sections
    .map((def, i) => {
      const filePath = path.join(CONTENT_DIR, def.file);
      if (!fs.existsSync(filePath)) {
        console.warn(`WARNING: content file not found: ${def.file}`);
        return null;
      }
      let md = fs.readFileSync(filePath, 'utf8');

      if (i === 0) {
        const extracted = extractHeroImage(md);
        heroSrc = extracted.heroSrc;
        heroAlt = extracted.heroAlt;
        md = extracted.md;
      }

      const navLabel = def.nav || extractH1(md) || def.file;
      const html = convertMarkdown(md, i === 0 ? 0 : 1, def.collapsible || false);
      return { id: def.id, navLabel, html };
    })
    .filter(Boolean);

  const indexHtml = renderIndexPage({ heroSrc, heroAlt, sections });
  fs.writeFileSync(path.join(OUTPUT_DIR, 'index.html'), indexHtml, 'utf8');
  console.log(`Built: public/index.html  (${sections.length} sections)`);

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
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
