'use strict';

const { pageNav, pageFooter } = require('./layout');
const { toDateString, escapeHtml, formatDate } = require('./utils');

/**
 * Groups events by date and sorts each day's events by start time.
 * Returns { dates: string[], byDate: Record<string, Event[]> }
 */
function groupAndSortEvents(events) {
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
  return { dates, byDate };
}

function eventExtraHtml(e) {
  const parts = [];
  if (e.description) {
    e.description
      .trim()
      .split(/\n\n+/)
      .forEach((p) => parts.push(`<p class="event-desc">${escapeHtml(p.trim())}</p>`));
  }
  if (e.link) {
    parts.push(
      `<a class="event-ext-link" href="${escapeHtml(String(e.link))}" target="_blank" rel="noopener">Extern länk →</a>`,
    );
  }
  return `<div class="event-extra">${parts.join('')}</div>`;
}

function icalDownloadLink(e) {
  if (!e.id) return '';
  return `<a href="schema/${escapeHtml(String(e.id))}/event.ics" class="ev-ical" download title="Ladda ner iCal">iCal</a>`;
}

function renderEventRow(e) {
  const timeStr = e.end
    ? `${escapeHtml(String(e.start))}–${escapeHtml(String(e.end))}`
    : escapeHtml(String(e.start));
  const metaParts = [e.location, e.responsible].filter(Boolean).map(escapeHtml);
  const metaEl = metaParts.length ? `<span class="ev-meta"> · ${metaParts.join(' · ')}</span>` : '';
  const icalEl = icalDownloadLink(e);
  const hasExtra = e.description || e.link;

  const idAttr = e.id ? ` data-event-id="${escapeHtml(String(e.id))}"` : '';
  const dateAttr = e.date ? ` data-event-date="${escapeHtml(String(e.date))}"` : '';

  if (hasExtra) {
    return [
      `    <details class="event-row"${idAttr}${dateAttr}>`,
      '      <summary>',
      `        <span class="ev-time">${timeStr}</span>`,
      `        <span class="ev-title">${escapeHtml(e.title)}</span>`,
      metaEl ? `        ${metaEl}` : '',
      icalEl ? `        ${icalEl}` : '',
      '      </summary>',
      `      ${eventExtraHtml(e)}`,
      '    </details>',
    ]
      .filter(Boolean)
      .join('\n');
  } else {
    return [
      `    <div class="event-row plain"${idAttr}${dateAttr}>`,
      `      <span class="ev-time">${timeStr}</span>`,
      `      <span class="ev-title">${escapeHtml(e.title)}</span>`,
      metaEl ? `      ${metaEl}` : '',
      icalEl ? `      ${icalEl}` : '',
      '    </div>',
    ]
      .filter(Boolean)
      .join('\n');
  }
}

function renderDaySection(date, dayEvents) {
  const rows = dayEvents.map(renderEventRow).join('\n');
  return [
    `  <details class="day" id="${date}" open>`,
    `    <summary>${formatDate(date)}</summary>`,
    '    <div class="event-list">',
    rows,
    '    </div>',
    '  </details>',
  ].join('\n');
}

function renderSchedulePage(camp, events, footerHtml = '', navSections = [], siteUrl = '') {
  const { dates, byDate } = groupAndSortEvents(events);
  const daySections = dates.map((date) => renderDaySection(date, byDate[date])).join('\n\n');
  const campName = escapeHtml(camp.name);

  let icalIconHtml = '';
  let webcalHtml = '';
  if (siteUrl) {
    const webcalUrl = escapeHtml(siteUrl.replace(/^https?:\/\//, 'webcal://') + '/schema.ics');
    webcalHtml = webcalUrl;
    icalIconHtml = `\n    <a href="kalender.html" class="ical-link" title="Prenumerera i kalender"><svg class="ical-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="9" y1="14" x2="9" y2="14.01"/><line x1="12" y1="14" x2="12" y2="14.01"/><line x1="15" y1="14" x2="15" y2="14.01"/><line x1="9" y1="17" x2="9" y2="17.01"/><line x1="12" y1="17" x2="12" y2="17.01"/></svg></a>`;
  }

  const guideHtml = siteUrl
    ? `\n  <p class="intro"><a href="kalender.html">Guide: Synka schemat till din kalender</a> · <a href="${webcalHtml}">Prenumerera direkt (webcal)</a></p>`
    : '';

  return `<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="noindex, nofollow">
  <title>Schema – ${campName}</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
${pageNav('schema.html', navSections)}
  <div class="schedule-header">
    <h1>Schema – ${campName}</h1>
    <a href="schema.rss" class="rss-link" title="RSS-feed"><img src="images/RSS-logo.webp" alt="RSS" class="rss-icon"></a>${icalIconHtml}
  </div>
  <p class="intro">Om du klickar på en aktivitets rubrik så finns det ofta lite mer detaljerad information. När plats säger [annat], då ska platsen stå i den detaljerade informationen.</p>
  <p class="intro">Lägret blir vad vi gör det till tillsammans, alla aktiviteter är deltagararrangerade. Känner man att det är någon aktivitet som man vill arrangera och behöver material till den, det kan vara allt ifrån bakingredienser till microbitar att programmera, kort sagt vad behöver ni som aktivitetsarrangör för att kunna hålla eran aktivitet? Kolla under <a href="lagg-till.html">Lägg till aktivitet</a>.</p>${guideHtml}

${daySections}
  <script src="session.js"></script>
  <script src="nav.js" defer></script>
${pageFooter(footerHtml)}
</body>
</html>
`;
}

module.exports = {
  toDateString,
  escapeHtml,
  formatDate,
  groupAndSortEvents,
  eventExtraHtml,
  renderEventRow,
  renderDaySection,
  renderSchedulePage,
};
