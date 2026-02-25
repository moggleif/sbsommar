'use strict';

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const QRCode = require('qrcode');
const { renderSchedulePage, toDateString } = require('./render');
const { renderAddPage } = require('./render-add');
const { renderEditPage, editApiUrl } = require('./render-edit');
const { renderTodayPage } = require('./render-today');
const { renderIdagPage } = require('./render-idag');
const { renderIndexPage, convertMarkdown, extractHeroImage, extractH1, renderUpcomingCampsHtml } = require('./render-index');
const { renderArkivPage } = require('./render-arkiv');

const DATA_DIR = path.join(__dirname, '..', 'data');
const CONTENT_DIR = path.join(__dirname, '..', 'content');
const ASSETS_DIR = path.join(__dirname, '..', 'assets');
const OUTPUT_DIR = path.join(__dirname, '../..', 'public');


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
// Merge opens_for_editing from the registry (camps.yaml) into the camp object.
// The per-camp YAML file does not include this field.
camp.opens_for_editing = activeCamp.opens_for_editing;
const events = campData.events || [];

// ── Load locations from local.yaml ───────────────────────────────────────────

const localFilePath = path.join(DATA_DIR, 'local.yaml');
if (!fs.existsSync(localFilePath)) {
  console.error('ERROR: data/local.yaml not found');
  process.exit(1);
}
const localData = yaml.load(fs.readFileSync(localFilePath, 'utf8'));
const locations = (localData.locations || []).map((l) => l.name);

// ── Helpers ───────────────────────────────────────────────────────────────────

// Removes all contents of dir except .gitkeep, to prevent stale build artefacts.
function cleanOutputDir(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir)) {
    if (entry === '.gitkeep') continue;
    fs.rmSync(path.join(dir, entry), { recursive: true, force: true });
  }
}

// Recursively copies all files from srcDir into destDir, flattening subdirectories.
function copyFlattened(srcDir, destDir) {
  const entries = fs.readdirSync(srcDir, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(srcDir, entry.name);
    if (entry.isDirectory()) {
      copyFlattened(srcPath, destDir);
    } else {
      fs.copyFileSync(srcPath, path.join(destDir, entry.name));
    }
  }
}

// ── Render and write ─────────────────────────────────────────────────────────

async function main() {
  cleanOutputDir(OUTPUT_DIR);
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  // ── Load footer from content/footer.md ────────────────────────────────────
  // Falls back to empty string if the file is missing — pages render without a footer.
  const footerMdPath = path.join(CONTENT_DIR, 'footer.md');
  const footerHtml = fs.existsSync(footerMdPath)
    ? convertMarkdown(fs.readFileSync(footerMdPath, 'utf8'))
    : '';

  // ── Load nav sections from content/sections.yaml ──────────────────────────
  // Resolved early so navSections can be passed to every render function.
  // Only sections with a nav: label are included.
  const sectionsConfigPath = path.join(CONTENT_DIR, 'sections.yaml');
  if (!fs.existsSync(sectionsConfigPath)) {
    console.error('ERROR: content/sections.yaml not found');
    process.exit(1);
  }
  const sectionsConfig = yaml.load(fs.readFileSync(sectionsConfigPath, 'utf8'));
  const navSections = (sectionsConfig.sections || [])
    .filter((def) => def.id && def.nav)
    .map((def) => ({ id: def.id, navLabel: def.nav }));

  const scheduleHtml = renderSchedulePage(camp, events, footerHtml, navSections);
  fs.writeFileSync(path.join(OUTPUT_DIR, 'schema.html'), scheduleHtml, 'utf8');
  console.log(`Built: public/schema.html  (${events.length} events)`);

  const qrSvg = (await QRCode.toString('https://sbsommar.se', { type: 'svg', margin: 2 }))
    .replace(/<\?xml[^?]*\?>\s*/g, '')
    .replace(/<!DOCTYPE[^>]*>\s*/g, '');

  const todayHtml = renderTodayPage(camp, events, qrSvg, footerHtml);
  fs.writeFileSync(path.join(OUTPUT_DIR, 'dagens-schema.html'), todayHtml, 'utf8');
  console.log(`Built: public/dagens-schema.html  (${events.length} events)`);

  const idagHtml = renderIdagPage(camp, events, footerHtml, navSections);
  fs.writeFileSync(path.join(OUTPUT_DIR, 'idag.html'), idagHtml, 'utf8');
  console.log(`Built: public/idag.html  (${events.length} events)`);

  const addHtml = renderAddPage(camp, locations, process.env.API_URL, footerHtml, navSections);
  fs.writeFileSync(path.join(OUTPUT_DIR, 'lagg-till.html'), addHtml, 'utf8');
  console.log(`Built: public/lagg-till.html  (${locations.length} locations)`);

  const editHtml = renderEditPage(camp, locations, editApiUrl(process.env.API_URL), footerHtml, navSections);
  fs.writeFileSync(path.join(OUTPUT_DIR, 'redigera.html'), editHtml, 'utf8');
  console.log(`Built: public/redigera.html`);

  // Load events for all archived camps
  const campEventsMap = {};
  for (const c of camps.filter((x) => x.archived === true)) {
    const evFile = path.join(DATA_DIR, c.file);
    if (fs.existsSync(evFile)) {
      const evData = yaml.load(fs.readFileSync(evFile, 'utf8')) || {};
      campEventsMap[c.id] = evData.events || [];
    }
  }

  const arkivHtml = renderArkivPage(camps, footerHtml, navSections, campEventsMap);
  fs.writeFileSync(path.join(OUTPUT_DIR, 'arkiv.html'), arkivHtml, 'utf8');
  const archivedCount = camps.filter((c) => c.archived === true).length;
  console.log(`Built: public/arkiv.html  (${archivedCount} archived camps)`);

  // ── Build events.json — public event data for the edit form ──────────────
  // Contains only fields the edit form needs; owner and meta are excluded.
  const PUBLIC_EVENT_FIELDS = ['id', 'title', 'date', 'start', 'end', 'location', 'responsible', 'description', 'link'];
  const eventsJson = JSON.stringify(
    events.map((e) => {
      const pub = {};
      for (const f of PUBLIC_EVENT_FIELDS) pub[f] = e[f] !== undefined ? e[f] : null;
      return pub;
    }),
    null,
    2,
  );
  fs.writeFileSync(path.join(OUTPUT_DIR, 'events.json'), eventsJson, 'utf8');
  console.log(`Built: public/events.json  (${events.length} events)`);

  // ── Render index.html from content/sections.yaml ─────────────────────────
  // sectionsConfig already loaded above for navSections.
  // Section order, IDs, and optional nav labels are defined in sections.yaml.
  // The first image in the first file is hoisted as the hero banner.

  let heroSrc = null;
  let heroAlt = null;

  // Pre-render the camp listing HTML to inject into the first section.
  const currentYear = new Date().getFullYear();
  const campListingHtml = renderUpcomingCampsHtml(camps, currentYear);

  const sections = sectionsConfig.sections
    .map((def, i) => {
      // Special section types that render from data instead of markdown
      if (def.type === 'upcoming-camps') {
        const html = renderUpcomingCampsHtml(camps, currentYear);
        if (!html) return null;
        const navLabel = def.nav || 'Kommande läger';
        return { id: def.id, navLabel, html };
      }

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
        // Strip the first H1 — the hero title now renders it.
        md = md.replace(/^# .+\n*/m, '').trimStart();
      }

      const navLabel = def.nav || extractH1(md) || def.file;
      let html = convertMarkdown(md, i === 0 ? 0 : 1, def.collapsible || false);

      // Inject camp listings into the first section, right after the first <h4>.
      if (i === 0 && campListingHtml) {
        html = html.replace(/(<\/h4>)/, '$1\n' + campListingHtml);
      }

      return { id: def.id, navLabel, html };
    })
    .filter(Boolean);

  // ── Compute hero social links and countdown target ────────────────────────
  const discordUrl = 'https://discord.com/channels/992817044527534181/1390691617052037232';

  // Countdown: find the nearest future camp by start_date
  const todayStr = new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Stockholm' });
  const futureCamps = camps
    .filter((c) => toDateString(c.start_date) > todayStr)
    .sort((a, b) => toDateString(a.start_date).localeCompare(toDateString(b.start_date)));
  const countdownTarget = futureCamps.length > 0 ? toDateString(futureCamps[0].start_date) : null;

  // Facebook link: prefer active camp, fall back to nearest future camp
  const facebookUrl = (activeCamp.link || '').trim()
    || (futureCamps.length > 0 && (futureCamps[0].link || '').trim())
    || null;

  const indexHtml = renderIndexPage({ heroSrc, heroAlt, sections, discordUrl, facebookUrl, countdownTarget }, footerHtml, navSections);
  fs.writeFileSync(path.join(OUTPUT_DIR, 'index.html'), indexHtml, 'utf8');
  console.log(`Built: public/index.html  (${sections.length} sections)`);

  // ── Generate robots.txt (02-§1a.1) ─────────────────────────────────────────

  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'robots.txt'),
    'User-agent: *\nDisallow: /\n',
    'utf8',
  );
  console.log('Built: public/robots.txt');

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

  // ── Copy assets → public ──────────────────────────────────

  const srcAssets = path.join(ASSETS_DIR);
  const destAssets = path.join(OUTPUT_DIR);

  if (fs.existsSync(srcAssets)) {
    fs.mkdirSync(destAssets, { recursive: true });
    copyFlattened(srcAssets, destAssets);
    console.log('Copied: assets → public (flattened)');
  } 
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
