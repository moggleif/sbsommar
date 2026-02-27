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

function renderEventRow(e) {
  const timeStr = e.end
    ? `${escapeHtml(String(e.start))}–${escapeHtml(String(e.end))}`
    : escapeHtml(String(e.start));
  const metaParts = [e.location, e.responsible].filter(Boolean).map(escapeHtml);
  const metaEl = metaParts.length ? `<span class="ev-meta"> · ${metaParts.join(' · ')}</span>` : '';
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

  let webcalHtml = '';
  if (siteUrl) {
    const webcalUrl = escapeHtml(siteUrl.replace(/^https?:\/\//, 'webcal://') + '/schema.ics');
    webcalHtml = `\n    <a href="${webcalUrl}" class="ical-link" title="Prenumerera i kalender">📆 iCal</a>`;
  }

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
    <a href="schema.rss" class="rss-link" title="RSS-feed"><img src="images/RSS-logo.webp" alt="RSS" class="rss-icon"></a>${webcalHtml}
  </div>
  <p class="intro">Om du klickar på en aktivitets rubrik så finns det ofta lite mer detaljerad information. När plats säger [annat], då ska platsen stå i den detaljerade informationen.</p>
  <p class="intro">Lägret blir vad vi gör det till tillsammans, alla aktiviteter är deltagararrangerade. Känner man att det är någon aktivitet som man vill arrangera och behöver material till den, det kan vara allt ifrån bakingredienser till microbitar att programmera, kort sagt vad behöver ni som aktivitetsarrangör för att kunna hålla eran aktivitet? Kolla under <a href="lagg-till.html">Lägg till aktivitet</a>.</p>

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
