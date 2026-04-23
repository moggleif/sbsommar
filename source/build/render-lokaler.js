'use strict';

// Locale overview page (02-§98). Issue #332.
//
// Renders a week-wide visual timeline that shows which locales are already
// booked at which times. One row per locale (from local.yaml, in file order),
// one column per camp day, events as absolute-positioned blocks inside their
// day's hour band. Everything is produced server-side; the page ships no
// client-side grid JS.

const { escapeHtml, toDateString } = require('./utils');
const { pageNav, pageFooter } = require('./layout');
const { goatcounterScript } = require('./analytics');
const { pwaHeadTags } = require('./pwa');

const FALLBACK_LOCATION = 'Annat';
const WEEKDAYS_SV = ['sön', 'mån', 'tis', 'ons', 'tor', 'fre', 'lör'];

// ── Helpers ─────────────────────────────────────────────────────────────────

function parseHHMM(hhmm) {
  const [h, m] = String(hhmm).split(':').map(Number);
  return h + (m || 0) / 60;
}

function enumerateDates(startDate, endDate) {
  const out = [];
  const start = new Date(`${startDate}T00:00:00Z`);
  const end = new Date(`${endDate}T00:00:00Z`);
  for (let d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

function formatDayHeader(isoDate) {
  const d = new Date(`${isoDate}T00:00:00Z`);
  const weekday = WEEKDAYS_SV[d.getUTCDay()];
  const day = d.getUTCDate();
  const month = d.getUTCMonth() + 1;
  return `${weekday} ${day}/${month}`;
}

/**
 * Groups events by locale name in the order they appear in the locations list.
 * Events whose `location` value is not found in the list fold into "Annat".
 * Each locale's event list is sorted by date then start time.
 *
 * @param {Array<{id?:string,date:string,start:string,end:string,title:string,location:string,responsible:string}>} events
 * @param {Array<{name:string}>} locations — objects from local.yaml
 * @returns {Map<string, Array>}
 */
function groupEventsByLocation(events, locations) {
  const groups = new Map();
  for (const loc of locations) {
    groups.set(loc.name, []);
  }
  // Ensure an Annat bucket exists even if local.yaml is ever missing it.
  if (!groups.has(FALLBACK_LOCATION)) groups.set(FALLBACK_LOCATION, []);

  for (const ev of events) {
    const key = groups.has(ev.location) ? ev.location : FALLBACK_LOCATION;
    groups.get(key).push(ev);
  }

  for (const arr of groups.values()) {
    arr.sort((a, b) => {
      if (a.date !== b.date) return a.date < b.date ? -1 : 1;
      if (a.start !== b.start) return a.start < b.start ? -1 : 1;
      return 0;
    });
  }

  return groups;
}

/**
 * Computes the horizontal hour band for the grid based on actual event hours.
 * Floors earliest start to the whole hour, ceils latest end. Cross-midnight
 * events (end <= start) are treated as ending at 24:00 for the purpose of
 * this range. Falls back to 08–22 when there are no events.
 *
 * @param {Array} events
 * @returns {{startHour:number, endHour:number}}
 */
function computeHourRange(events) {
  if (!events || events.length === 0) return { startHour: 8, endHour: 22 };
  let minStart = Infinity;
  let maxEnd = -Infinity;
  for (const ev of events) {
    const s = parseHHMM(ev.start);
    let e = parseHHMM(ev.end);
    if (e <= s) e = 24;
    if (s < minStart) minStart = s;
    if (e > maxEnd) maxEnd = e;
  }
  return { startHour: Math.floor(minStart), endHour: Math.ceil(maxEnd) };
}

/**
 * Computes the horizontal position (left%, width%) for an event block within
 * a day band spanning [dayStartHour, dayEndHour]. Events extending past the
 * band edges are clipped. Cross-midnight events (end <= start) are clipped
 * at the day end.
 *
 * @param {{start:string,end:string}} event
 * @param {number} dayStartHour
 * @param {number} dayEndHour
 * @returns {{leftPct:number, widthPct:number}}
 */
function positionBlock(event, dayStartHour, dayEndHour) {
  const startH = parseHHMM(event.start);
  let endH = parseHHMM(event.end);
  if (endH <= startH) endH = 24;

  const clippedStart = Math.max(startH, dayStartHour);
  const clippedEnd = Math.min(endH, dayEndHour);
  const bandHours = dayEndHour - dayStartHour;

  const leftPct = ((clippedStart - dayStartHour) / bandHours) * 100;
  const widthPct = Math.max(0, ((clippedEnd - clippedStart) / bandHours) * 100);
  return { leftPct, widthPct };
}

// ── Rendering ───────────────────────────────────────────────────────────────

function ariaLabelFor(event, locationName, isoDate) {
  const day = formatDayHeader(isoDate);
  const who = event.responsible ? `, ansvarig ${event.responsible}` : '';
  return `${locationName}, ${day}, ${event.start}–${event.end} ${event.title}${who}`;
}

// CSS is emitted in a single <style> block to keep the HTML free of inline
// style attributes (html-validate: no-inline-style). Each event block gets a
// data-lb attribute that is targeted from that block.
function blockCssSelector(dataLb) {
  // dataLb values come from event IDs which are slug-format (letters, digits,
  // hyphens). We still escape for safety.
  return `[data-lb="${dataLb.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"]`;
}

function renderEventBlock(event, locationName, isoDate, positionRules, blockIndex) {
  const { leftPct, widthPct } = positionBlock(
    event,
    positionRules.dayStartHour,
    positionRules.dayEndHour,
  );
  if (widthPct <= 0) return '';

  const dataLb = `${event.id || `evt-${blockIndex}`}`;
  positionRules.rules.push(
    `${blockCssSelector(dataLb)}{left:${leftPct.toFixed(4)}%;width:${widthPct.toFixed(4)}%;}`,
  );

  const href = event.id ? `schema/${encodeURIComponent(event.id)}/` : 'schema.html';
  const aria = escapeHtml(ariaLabelFor(event, locationName, isoDate));
  const title = escapeHtml(event.title);
  const time = `${escapeHtml(event.start)}–${escapeHtml(event.end)}`;
  const resp = event.responsible ? escapeHtml(event.responsible) : '';
  const dataLbAttr = escapeHtml(dataLb);
  return `<a class="event-block" data-lb="${dataLbAttr}" href="${href}" aria-label="${aria}"><span class="event-block__title">${title}</span><span class="event-block__time">${time}</span>${resp ? `<span class="event-block__resp">${resp}</span>` : ''}</a>`;
}

function renderDayBand(eventsOnDay, locationName, isoDate, positionRules) {
  if (eventsOnDay.length === 0) {
    return '<div class="day-band day-band--empty"></div>';
  }
  const blocks = eventsOnDay
    .map((ev, i) => renderEventBlock(ev, locationName, isoDate, positionRules, `${locationName}-${isoDate}-${i}`))
    .filter(Boolean)
    .join('');
  return `<div class="day-band">${blocks}</div>`;
}

function renderLokalRow(locationName, locationEvents, campDates, positionRules) {
  const label = `<div class="lokal-label">${escapeHtml(locationName)}</div>`;

  if (locationEvents.length === 0) {
    const empty = `<div class="day-band day-band--all-empty"><span class="lokal-empty">Inga bokningar</span></div>`;
    return `<div class="lokal-row lokal-row--empty">${label}${empty}</div>`;
  }

  const byDate = new Map(campDates.map((d) => [d, []]));
  for (const ev of locationEvents) {
    if (byDate.has(ev.date)) byDate.get(ev.date).push(ev);
  }

  const bands = campDates
    .map((d) => renderDayBand(byDate.get(d) || [], locationName, d, positionRules))
    .join('');

  return `<div class="lokal-row">${label}${bands}</div>`;
}

function renderDayHeader(isoDate) {
  return `<div class="day-band-label">${escapeHtml(formatDayHeader(isoDate))}</div>`;
}

/**
 * Renders the full /lokaler.html page.
 *
 * @param {Object} camp                  — active camp (with name, start_date, end_date)
 * @param {Array<{name:string}>} locations — locations from local.yaml (order matters)
 * @param {Array} events                 — events for the active camp
 * @param {string} [footerHtml]
 * @param {Array} [navSections]
 * @param {string} [goatcounterCode]
 * @returns {string}
 */
function renderLokalerPage(camp, locations, events, footerHtml = '', navSections = [], goatcounterCode = '') {
  const campName = escapeHtml(camp.name);
  const startDate = toDateString(camp.start_date);
  const endDate = toDateString(camp.end_date);
  const campDates = enumerateDates(startDate, endDate);

  const { startHour, endHour } = computeHourRange(events);
  const groups = groupEventsByLocation(events, locations);

  const positionRules = { dayStartHour: startHour, dayEndHour: endHour, rules: [] };

  const dayHeaders = campDates.map(renderDayHeader).join('');
  const rows = [...groups.entries()]
    .map(([name, evts]) => renderLokalRow(name, evts, campDates, positionRules))
    .join('\n');

  // One inline <style> block covers the grid sizing and per-event positions.
  // This avoids `style=""` attributes in rendered markup (html-validate:
  // no-inline-style) while still allowing dynamic per-event placement.
  const gridStyleBlock = `<style>
.lokaler-grid { --lokaler-day-count: ${campDates.length}; --lokaler-hour-span: ${endHour - startHour}; }
${positionRules.rules.join('\n')}
</style>`;

  return `<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="noindex, nofollow">
  <title>Lokalöversikt – ${campName}</title>
  <link rel="stylesheet" href="style.css">
  <link rel="icon" type="image/png" href="images/sbsommar-icon-192.png">
${pwaHeadTags()}
  ${gridStyleBlock}
</head>
<body>
${pageNav('lokaler.html', navSections)}
<main>
  <h1>Lokalöversikt</h1>
  <p class="intro">Se vilka tider varje lokal redan är upptagen — välj en ledig tid när du <a href="lagg-till.html">lägger till en aktivitet</a>. Klicka på ett tidsblock för mer information.</p>

  <div class="lokaler-grid-wrapper">
    <div class="lokaler-grid">
      <div class="lokal-label lokal-label--header"></div>
${dayHeaders}
${rows}
    </div>
  </div>

  <p class="lokaler-legend">Varje färgat block är en bokad aktivitet. Rader märkta "Inga bokningar" betyder att lokalen är ledig hela veckan. Behöver du flytta något du lagt till? <a href="redigera.html">Redigera aktivitet</a>.</p>
</main>
  <script src="wp-cleanup.js"></script>
  <script src="nav.js" defer></script>
  <script src="feedback.js" defer></script>
  <script src="sw-register.js" defer></script>
  <script src="pwa-install.js" defer></script>
  <script src="admin.js" defer></script>${goatcounterScript(goatcounterCode)}
${pageFooter(footerHtml)}
</body>
</html>
`;
}

module.exports = {
  renderLokalerPage,
  groupEventsByLocation,
  computeHourRange,
  positionBlock,
};
