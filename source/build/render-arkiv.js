'use strict';

const { pageNav, pageFooter } = require('./layout');
const { escapeHtml, toDateString, formatDate } = require('./utils');

const MONTHS_SV = [
  'januari', 'februari', 'mars', 'april', 'maj', 'juni',
  'juli', 'augusti', 'september', 'oktober', 'november', 'december',
];

// Formats a compact header date range: "D–D månadsnamn YYYY"
// When months differ: "D månadsnamn – D månadsnamn YYYY"
function formatHeaderDateRange(startStr, endStr) {
  const s = new Date(toDateString(startStr) + 'T12:00:00');
  const e = new Date(toDateString(endStr) + 'T12:00:00');
  const year = e.getFullYear();
  if (s.getMonth() === e.getMonth()) {
    return `${s.getDate()}–${e.getDate()} ${MONTHS_SV[e.getMonth()]} ${year}`;
  }
  return `${s.getDate()} ${MONTHS_SV[s.getMonth()]} – ${e.getDate()} ${MONTHS_SV[e.getMonth()]} ${year}`;
}

// Groups events by date and sorts by start time within each day
function groupAndSortEvents(events) {
  const byDate = {};
  for (const ev of events) {
    const d = toDateString(ev.date);
    if (!byDate[d]) byDate[d] = [];
    byDate[d].push(ev);
  }
  const dates = Object.keys(byDate).sort();
  for (const d of dates) {
    byDate[d].sort((a, b) => String(a.start).localeCompare(String(b.start)));
  }
  return { dates, byDate };
}

// Renders the expandable detail content for events with description/link
function eventExtraHtml(ev) {
  const parts = [];
  if (ev.description) {
    ev.description
      .trim()
      .split(/\n\n+/)
      .forEach((p) => parts.push(`<p class="event-desc">${escapeHtml(p.trim())}</p>`));
  }
  if (ev.link) {
    parts.push(
      `<a class="event-ext-link" href="${escapeHtml(String(ev.link))}" target="_blank" rel="noopener">Extern länk →</a>`,
    );
  }
  return `<div class="event-extra">${parts.join('')}</div>`;
}

// Renders an event row — expandable <details> when description/link present,
// otherwise a flat <div>
function renderArchiveEventRow(ev) {
  const timeStr = ev.end
    ? `${escapeHtml(String(ev.start))}–${escapeHtml(String(ev.end))}`
    : escapeHtml(String(ev.start));
  const metaParts = [ev.location, ev.responsible].filter(Boolean).map(escapeHtml);
  const metaEl = metaParts.length ? `<span class="ev-meta"> · ${metaParts.join(' · ')}</span>` : '';
  const hasExtra = ev.description || ev.link;

  if (hasExtra) {
    return `        <details class="event-row">
          <summary>
            <span class="ev-time">${timeStr}</span>
            <span class="ev-title">${escapeHtml(ev.title)}</span>${metaEl ? `\n            ${metaEl}` : ''}
          </summary>
          ${eventExtraHtml(ev)}
        </details>`;
  }

  return `        <div class="event-row plain">
          <span class="ev-time">${timeStr}</span>
          <span class="ev-title">${escapeHtml(ev.title)}</span>${metaEl ? `\n          ${metaEl}` : ''}
        </div>`;
}

// Renders the event list section for a camp's events
function renderEventsSection(events) {
  if (!events || events.length === 0) return '';

  const { dates, byDate } = groupAndSortEvents(events);
  const daySections = dates.map((d) => {
    const heading = formatDate(toDateString(d));
    const rows = byDate[d].map(renderArchiveEventRow).join('\n');
    return `      <div class="archive-day">
        <h3 class="archive-day-heading">${escapeHtml(heading)}</h3>
${rows}
      </div>`;
  });

  return `\n      <div class="archive-events">
${daySections.join('\n')}
      </div>`;
}

function renderArkivPage(allCamps, footerHtml = '', navSections = [], campEventsMap = {}) {
  const camps = [...allCamps]
    .filter((c) => c.archived === true)
    .sort((a, b) => toDateString(b.start_date).localeCompare(toDateString(a.start_date)));

  const items = camps.map((camp) => {
    const id = escapeHtml(camp.id || '');
    const panelId = `panel-${id}`;
    const name = escapeHtml(camp.name || '');
    const headerDateRange = escapeHtml(formatHeaderDateRange(camp.start_date, camp.end_date));
    const location = escapeHtml(camp.location || '');
    const info = (camp.information || '').trim();
    const link = (camp.link || '').trim();

    const infoHtml = info
      ? `\n        <p class="camp-information">${escapeHtml(info)}</p>`
      : '';

    const linkHtml = link
      ? `\n        <a class="camp-fb-link" href="${escapeHtml(link)}" target="_blank" rel="noopener noreferrer"><img src="images/social-facebook-button-blue-icon-small.webp" alt="Facebookgrupp" class="camp-fb-logo"></a>`
      : '';

    const campEvents = campEventsMap[camp.id] || [];
    const eventsHtml = renderEventsSection(campEvents);

    return `  <li class="timeline-item">
    <div class="timeline-dot" aria-hidden="true"></div>
    <div class="timeline-card">
      <button type="button" class="timeline-header" aria-expanded="false" aria-controls="${panelId}">
        <span class="timeline-name">${name}</span>
        <span class="timeline-meta">${headerDateRange} · ${location}</span>
        <span class="timeline-chevron" aria-hidden="true"></span>
      </button>
      <div class="timeline-panel" id="${panelId}" hidden>${linkHtml}${infoHtml}${eventsHtml}
      </div>
    </div>
  </li>`;
  }).join('\n');

  return `<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="noindex, nofollow">
  <title>Arkiv – SB Sommar</title>
  <link rel="stylesheet" href="style.css">
  <link rel="icon" type="image/webp" href="images/RFSBsommarLogo.webp">
</head>
<body>
${pageNav('arkiv.html', navSections)}

  <div class="page-content">
    <h1>Lägerarkiv</h1>
    <p class="intro">Alla tidigare läger. Klicka på ett läger för att se mer information.</p>

    <ol class="timeline">
${items}
    </ol>
  </div>

  <script src="arkiv.js"></script>
  <script src="nav.js" defer></script>
${pageFooter(footerHtml)}
</body>
</html>`;
}

module.exports = { renderArkivPage };
