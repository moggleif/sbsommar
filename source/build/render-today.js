'use strict';

const { escapeHtml, toDateString } = require('./render');
const { pageFooter } = require('./layout');

/**
 * Renders the "Dagens schema" page.
 * All events are embedded as JSON; client-side JS filters to the current day.
 * Uses display-mode (dark) styling for screen/projector use.
 * No navigation – clean display layout with QR code sidebar.
 */
function renderTodayPage(camp, events, qrSvg, footerHtml = '') {
  const campName = escapeHtml(camp.name);

  const eventsJson = JSON.stringify(
    events.map((e) => ({
      title: e.title,
      date: toDateString(e.date),
      start: String(e.start),
      end: e.end ? String(e.end) : null,
      location: e.location || null,
      responsible: e.responsible || null,
      description: e.description || null,
      link: e.link || null,
    })),
  );

  return `<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="noindex, nofollow">
  <title>Dagens schema – ${campName}</title>
  <link rel="stylesheet" href="style.css">
</head>
<body class="display-mode">

  <h1 id="today-heading">Dagens schema</h1>

  <div class="dagens-layout">

    <div class="dagens-events">
      <div id="today-events"></div>
    </div>

    <aside class="dagens-sidebar">
      <p class="sidebar-text">Detta är schemat för aktiviteter som sker idag. För kartor, information och schema andra dagar – besök sbsommar.se eller skanna QR-koden.</p>
      <div class="qr-wrap">${qrSvg}</div>
    </aside>

  </div>

  <script>window.__EVENTS__ = ${eventsJson}; window.__HEADING_PREFIX__ = 'Dagens schema'; window.__EMPTY_CLASS__ = 'sidebar-text'; window.__SHOW_FOOTER__ = true;</script>
  <script src="events-today.js"></script>
${pageFooter(footerHtml)}
</body>
</html>
`;
}

module.exports = { renderTodayPage };
