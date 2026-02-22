'use strict';

const { escapeHtml, toDateString } = require('./render');

/**
 * Renders the "Idag" page – today's schedule in the standard site layout.
 * All events are embedded as JSON; client-side JS filters to the current day.
 */
function renderIdagPage(camp, events) {
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
  <title>Idag – ${campName}</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <nav class="page-nav">
    <a class="nav-link" href="index.html">Hem</a>
    <a class="nav-link" href="schema.html">Schema</a>
    <a class="nav-link active" href="idag.html">Idag</a>
    <a class="nav-link" href="lagg-till.html">L\u00e4gg till aktivitet</a>
  </nav>

  <h1 id="today-heading">Idag</h1>
  <p class="intro">Aktiviteterna nedan \u00e4r schemalagda f\u00f6r idag. Kolla g\u00e4rna <a href="schema.html">hela schemat</a> f\u00f6r \u00f6vriga dagar.</p>

  <div id="today-events"></div>

  <script>
    (function () {
      var events = ${eventsJson};

      function pad(n) { return String(n).padStart(2, '0'); }
      var now = new Date();
      var today = now.getFullYear() + '-' + pad(now.getMonth() + 1) + '-' + pad(now.getDate());

      var weekdays = ['s\u00f6ndag', 'm\u00e5ndag', 'tisdag', 'onsdag', 'torsdag', 'fredag', 'l\u00f6rdag'];
      var months = ['januari', 'februari', 'mars', 'april', 'maj', 'juni', 'juli', 'augusti', 'september', 'oktober', 'november', 'december'];
      var label = weekdays[now.getDay()] + ' ' + now.getDate() + ' ' + months[now.getMonth()] + ' ' + now.getFullYear();
      document.getElementById('today-heading').textContent = 'Idag \u2013 ' + label;

      var todayEvents = events.filter(function (e) { return e.date === today; });
      todayEvents.sort(function (a, b) { return a.start.localeCompare(b.start); });

      var container = document.getElementById('today-events');

      if (todayEvents.length === 0) {
        container.innerHTML = '<p class="intro">Inga aktiviteter schemalagda f\u00f6r idag.</p>';
        return;
      }

      function esc(s) {
        if (s == null) return '';
        return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
      }

      var rows = todayEvents.map(function (e) {
        var timeStr = e.end ? esc(e.start) + '\u2013' + esc(e.end) : esc(e.start);
        var metaParts = [e.location, e.responsible].filter(Boolean).map(esc);
        var metaEl = metaParts.length ? '<span class="ev-meta"> \u00b7 ' + metaParts.join(' \u00b7 ') + '</span>' : '';
        var hasExtra = e.description || e.link;

        if (hasExtra) {
          var extraParts = [];
          if (e.description) {
            e.description.trim().split(/\\n\\n+/).forEach(function (p) {
              extraParts.push('<p class="event-desc">' + esc(p.trim()) + '</p>');
            });
          }
          if (e.link) {
            extraParts.push('<a class="event-ext-link" href="' + esc(e.link) + '" target="_blank" rel="noopener">Extern l\u00e4nk \u2192</a>');
          }
          return '<details class="event-row"><summary>' +
            '<span class="ev-time">' + timeStr + '</span>' +
            '<span class="ev-title">' + esc(e.title) + '</span>' +
            metaEl + '</summary>' +
            '<div class="event-extra">' + extraParts.join('') + '</div>' +
            '</details>';
        } else {
          return '<div class="event-row plain">' +
            '<span class="ev-time">' + timeStr + '</span>' +
            '<span class="ev-title">' + esc(e.title) + '</span>' +
            metaEl + '</div>';
        }
      });

      container.innerHTML = '<div class="today-card"><div class="event-list">' + rows.join('') + '</div></div>';
    })();
  </script>
</body>
</html>
`;
}

module.exports = { renderIdagPage };
