'use strict';

const { escapeHtml, toDateString } = require('./render');
const { pageNav, pageFooter } = require('./layout');

/**
 * Renders the "Idag" page – today's schedule in the standard site layout.
 * All events are embedded as JSON; client-side JS filters to the current day.
 */
function renderIdagPage(camp, events, footerHtml = '') {
  const campName = escapeHtml(camp.name);

  const eventsJson = JSON.stringify(
    events.map((e) => ({
      id: e.id || null,
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
  <title>Idag – ${campName}</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
${pageNav('idag.html')}

  <h1 id="today-heading">Idag</h1>
  <p class="intro">Aktiviteterna nedan är schemalagda för idag. Kolla gärna <a href="schema.html">hela schemat</a> för övriga dagar.</p>

  <div id="today-events"></div>

  <script>window.__EVENTS__ = ${eventsJson}; window.__HEADING_PREFIX__ = 'Idag'; window.__EMPTY_CLASS__ = 'intro'; window.__SHOW_FOOTER__ = false;</script>
  <script src="events-today.js"></script>
  <script src="session.js"></script>
${pageFooter(footerHtml)}
</body>
</html>
`;
}

module.exports = { renderIdagPage };
