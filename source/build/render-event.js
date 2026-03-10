'use strict';

const { escapeHtml, formatDate, toDateString } = require('./utils');
const { pageNav, pageFooter } = require('./layout');
const { renderDescriptionHtml } = require('./markdown');

/**
 * Renders a static HTML detail page for a single event.
 *
 * @param {object} event - Event object
 * @param {object} camp - Camp object (for page title)
 * @param {string} siteUrl - Base URL (unused in HTML but kept for consistency)
 * @param {string} [footerHtml=''] - Pre-rendered footer HTML
 * @param {Array}  [navSections=[]] - Navigation sections
 * @returns {string} Full HTML page
 */
function renderEventPage(event, camp, siteUrl, footerHtml = '', navSections = []) {
  const title = escapeHtml(event.title);
  const campName = escapeHtml(camp.name);
  const date = formatDate(toDateString(event.date));
  const timeStr = event.end
    ? `${escapeHtml(String(event.start))}–${escapeHtml(String(event.end))}`
    : escapeHtml(String(event.start));

  let descriptionHtml = '';
  if (event.description) {
    const rendered = renderDescriptionHtml(event.description);
    descriptionHtml = `    <div class="event-description">\n      <p class="event-section-label">Beskrivning</p>\n      ${rendered}\n    </div>\n`;
  }

  let linkHtml = '';
  if (event.link) {
    linkHtml = `    <p class="event-link-row"><a class="event-ext-link" href="${escapeHtml(String(event.link))}" target="_blank" rel="noopener noreferrer">Extern länk (för diskussion etc) →</a></p>\n`;
  }

  return `<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="noindex, nofollow">
  <base href="../../">
  <title>${title}</title>
  <link rel="stylesheet" href="style.css">
  <link rel="icon" type="image/webp" href="images/rfsb-logo.webp">
</head>
<body>
${pageNav('schema.html', navSections)}
<main>
  <p class="back-link"><a href="schema.html">← Tillbaka till schemat</a></p>
  <h1>${title}</h1>
  <div class="event-detail">
    <p>📅 ${date} 🕐 ${timeStr}</p>
    <p>📍 <strong>Plats:</strong> ${escapeHtml(event.location)} · 👤 <strong>Ansvarig:</strong> ${escapeHtml(event.responsible)}</p>
    <p>📆 <a href="schema/${escapeHtml(String(event.id))}/event.ics" download>Lägg till i kalender (.ics)</a></p>
${descriptionHtml}${linkHtml}  </div>
</main>
  <script src="nav.js" defer></script>
  <script src="feedback.js" defer></script>
${pageFooter(footerHtml)}
</body>
</html>
`;
}

module.exports = { renderEventPage };
