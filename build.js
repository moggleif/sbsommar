'use strict';

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const DATA_DIR = path.join(__dirname, 'data');
const OUTPUT_DIR = path.join(__dirname, 'public', 'schema');

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
  // Parse as local date (noon to avoid DST edge cases)
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

// Find the active camp; fall back to the most recent archived camp
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

const daySections = dates.map((date) => {
  const dayEvents = byDate[date];

  const rows = dayEvents
    .map((e) => {
      const endPart = e.end ? `<span class="end-time">–${escapeHtml(String(e.end))}</span>` : '';
      const timeCell = `<strong>${escapeHtml(String(e.start))}</strong>${endPart}`;
      const activityCell = [
        `<span class="title">${escapeHtml(e.title)}</span>`,
        e.location ? `<span class="location">${escapeHtml(e.location)}</span>` : '',
      ].filter(Boolean).join('');
      return [
        '        <tr>',
        `          <td class="time">${timeCell}</td>`,
        `          <td class="activity">${activityCell}</td>`,
        `          <td class="responsible">${escapeHtml(e.responsible)}</td>`,
        '        </tr>',
      ].join('\n');
    })
    .join('\n');

  return [
    `  <section class="day" id="${date}">`,
    `    <h2>${formatDate(date)}</h2>`,
    '    <table>',
    '      <thead>',
    '        <tr>',
    '          <th>Tid</th>',
    '          <th>Aktivitet</th>',
    '          <th>Ansvarig</th>',
    '        </tr>',
    '      </thead>',
    '      <tbody>',
    rows,
    '      </tbody>',
    '    </table>',
    '  </section>',
  ].join('\n');
}).join('\n\n');

// Day navigation links
const navLinks = dates
  .map((d) => `<a href="#${d}">${formatDate(d).split(' ').slice(0, 2).join(' ')}</a>`)
  .join('\n    ');

const campName = escapeHtml(camp.name);
const campLocation = escapeHtml(camp.location);
const startDate = toDateString(camp.start_date);
const endDate = toDateString(camp.end_date);

const html = `<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Schema – ${campName}</title>
  <style>
    :root {
      --color-terracotta: #C76D48;
      --color-sage:       #ADBF77;
      --color-cream:      #F5EEDF;
      --color-navy:       #192A3D;
      --color-charcoal:   #3B3A38;
      --color-white:      #FFFFFF;
      --font-sans: system-ui, -apple-system, sans-serif;
      --space-xs:  8px;
      --space-sm:  16px;
      --space-md:  24px;
      --space-lg:  40px;
      --container: 1290px;
      --radius-sm: 4px;
      --radius-md: 6px;
      --shadow-card: 0 4px 12px rgba(0, 0, 0, 0.06);
    }
    *, *::before, *::after { box-sizing: border-box; }
    body {
      font-family: var(--font-sans);
      max-width: var(--container);
      margin: 0 auto;
      padding: var(--space-md) var(--space-sm);
      color: var(--color-charcoal);
      background: var(--color-cream);
      font-size: 16px;
      line-height: 1.65;
    }
    h1 {
      font-size: 40px;
      font-weight: 700;
      color: var(--color-navy);
      margin: 0 0 var(--space-xs);
    }
    .meta {
      font-size: 14px;
      color: var(--color-charcoal);
      margin-bottom: var(--space-lg);
    }
    nav {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-xs);
      margin-bottom: var(--space-lg);
    }
    nav a {
      display: inline-block;
      padding: 6px 14px;
      background: var(--color-white);
      border: 1px solid transparent;
      border-radius: var(--radius-sm);
      text-decoration: none;
      font-size: 12px;
      font-weight: 700;
      color: var(--color-charcoal);
      text-transform: uppercase;
      letter-spacing: 0.08em;
      white-space: nowrap;
      transition: color 200ms ease, border-color 200ms ease;
    }
    nav a:hover {
      color: var(--color-terracotta);
      border-color: var(--color-terracotta);
    }
    .day {
      margin-bottom: var(--space-lg);
      background: var(--color-white);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-card);
      overflow: hidden;
    }
    h2 {
      font-size: 14px;
      font-weight: 700;
      color: var(--color-white);
      text-transform: capitalize;
      margin: 0;
      padding: var(--space-sm) var(--space-md);
      background: var(--color-navy);
      letter-spacing: 0.04em;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 14px;
    }
    thead th {
      text-align: left;
      padding: 8px var(--space-md);
      background: var(--color-cream);
      font-size: 11px;
      font-weight: 700;
      color: var(--color-charcoal);
      text-transform: uppercase;
      letter-spacing: 0.06em;
      border-bottom: 1px solid rgba(0, 0, 0, 0.08);
    }
    td {
      padding: 10px var(--space-md);
      border-bottom: 1px solid rgba(0, 0, 0, 0.05);
      vertical-align: top;
    }
    tr:last-child td { border-bottom: none; }
    .time {
      white-space: nowrap;
      font-variant-numeric: tabular-nums;
      width: 8rem;
    }
    .time strong {
      color: var(--color-navy);
      font-weight: 700;
    }
    .time .end-time {
      color: var(--color-charcoal);
      opacity: 0.55;
    }
    .activity {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .activity .title {
      color: var(--color-navy);
      font-weight: 500;
    }
    .activity .location {
      font-size: 12px;
      color: var(--color-charcoal);
      opacity: 0.7;
    }
    .responsible {
      color: var(--color-charcoal);
      font-size: 13px;
    }
    @media (max-width: 690px) {
      h1 { font-size: 28px; }
      .responsible { display: none; }
      .time { width: 6rem; }
      td { padding: 8px var(--space-sm); }
      thead th { padding: 6px var(--space-sm); }
      h2 { padding: var(--space-sm); }
    }
  </style>
</head>
<body>
  <h1>Schema – ${campName}</h1>
  <p class="meta">${campLocation} · ${startDate} – ${endDate}</p>
  <nav>
    ${navLinks}
  </nav>

${daySections}
</body>
</html>
`;

// ── Write output ─────────────────────────────────────────────────────────────

fs.mkdirSync(OUTPUT_DIR, { recursive: true });
fs.writeFileSync(path.join(OUTPUT_DIR, 'index.html'), html, 'utf8');

console.log(
  `Built: public/schema/index.html  (${dates.length} days, ${events.length} events)`,
);
