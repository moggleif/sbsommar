'use strict';

const { pageNav, pageFooter } = require('./layout');
const { escapeHtml, toDateString } = require('./utils');

const MONTHS_SV = [
  'januari', 'februari', 'mars', 'april', 'maj', 'juni',
  'juli', 'augusti', 'september', 'oktober', 'november', 'december',
];

// Formats a date string as "D månadsnamn" (e.g. "22 juni")
function formatShortDate(dateStr) {
  const d = new Date(toDateString(dateStr) + 'T12:00:00');
  return `${d.getDate()} ${MONTHS_SV[d.getMonth()]}`;
}

// Formats a camp date range as "D månadsnamn – D månadsnamn YYYY"
// e.g. "22 juni – 29 juni 2025"
function formatDateRange(startStr, endStr) {
  const end = new Date(toDateString(endStr) + 'T12:00:00');
  const year = end.getFullYear();
  return `${formatShortDate(startStr)} – ${formatShortDate(endStr)} ${year}`;
}

function renderArkivPage(allCamps, footerHtml = '', navSections = []) {
  const camps = [...allCamps]
    .filter((c) => c.archived === true)
    .sort((a, b) => toDateString(b.start_date).localeCompare(toDateString(a.start_date)));

  const items = camps.map((camp) => {
    const id = escapeHtml(camp.id || '');
    const panelId = `panel-${id}`;
    const name = escapeHtml(camp.name || '');
    const dateRange = escapeHtml(formatDateRange(camp.start_date, camp.end_date));
    const location = escapeHtml(camp.location || '');
    const info = (camp.information || '').trim();
    const link = (camp.link || '').trim();

    const infoHtml = info
      ? `\n        <p class="camp-information">${escapeHtml(info)}</p>`
      : '';

    const linkHtml = link
      ? `\n        <a class="btn btn-secondary camp-link" href="${escapeHtml(link)}" target="_blank" rel="noopener noreferrer">Facebookgrupp →</a>`
      : '';

    return `  <li class="timeline-item">
    <div class="timeline-dot" aria-hidden="true"></div>
    <div class="timeline-card">
      <button class="timeline-header" aria-expanded="false" aria-controls="${panelId}">
        <span class="timeline-name">${name}</span>
        <span class="timeline-chevron" aria-hidden="true"></span>
      </button>
      <div class="timeline-panel" id="${panelId}" hidden>
        <dl class="camp-meta">
          <dt>Datum</dt>
          <dd>${dateRange}</dd>
          <dt>Plats</dt>
          <dd>${location}</dd>
        </dl>${infoHtml}${linkHtml}
      </div>
    </div>
  </li>`;
  }).join('\n');

  return `<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Arkiv – SB Sommar</title>
  <link rel="stylesheet" href="style.css">
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
  <script src="nav.js"></script>
${pageFooter(footerHtml)}
</body>
</html>`;
}

module.exports = { renderArkivPage };
