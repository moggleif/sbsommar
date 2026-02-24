/**
 * Shared client-side script for "Idag" and "Dagens schema" pages.
 *
 * Expects three globals set by an inline <script> before this file loads:
 *   window.__EVENTS__         – array of event objects (JSON from build)
 *   window.__HEADING_PREFIX__ – string to prepend to the date in the h1
 *   window.__EMPTY_CLASS__    – CSS class for the "no events" paragraph
 *   window.__SHOW_FOOTER__    – boolean; if true, renders an activity count footer
 */
(function () {
  var events = window.__EVENTS__ || [];
  var headingPrefix = window.__HEADING_PREFIX__ || '';
  var emptyClass = window.__EMPTY_CLASS__ || 'intro';
  var showFooter = window.__SHOW_FOOTER__ || false;

  function pad(n) { return String(n).padStart(2, '0'); }

  var now = new Date();
  var today = now.getFullYear() + '-' + pad(now.getMonth() + 1) + '-' + pad(now.getDate());

  var weekdays = ['söndag', 'måndag', 'tisdag', 'onsdag', 'torsdag', 'fredag', 'lördag'];
  var months = ['januari', 'februari', 'mars', 'april', 'maj', 'juni', 'juli', 'augusti', 'september', 'oktober', 'november', 'december'];
  var label = weekdays[now.getDay()] + ' ' + now.getDate() + ' ' + months[now.getMonth()] + ' ' + now.getFullYear();

  var heading = document.getElementById('today-heading');
  if (heading) heading.textContent = headingPrefix + ' – ' + label;

  var todayEvents = events.filter(function (e) { return e.date === today; });
  todayEvents.sort(function (a, b) { return a.start.localeCompare(b.start); });

  var container = document.getElementById('today-events');
  if (!container) return;

  if (todayEvents.length === 0) {
    container.innerHTML = '<p class="' + emptyClass + '">Inga aktiviteter schemalagda för idag.</p>';
    return;
  }

  function esc(s) {
    if (s == null) return '';
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  var rows = todayEvents.map(function (e) {
    var timeStr = e.end ? esc(e.start) + '–' + esc(e.end) : esc(e.start);
    var metaParts = [e.location, e.responsible].filter(Boolean).map(esc);
    var metaEl = metaParts.length ? '<span class="ev-meta"> · ' + metaParts.join(' · ') + '</span>' : '';
    var hasExtra = e.description || e.link;
    var idAttr = e.id ? ' data-event-id="' + esc(e.id) + '"' : '';
    var dateAttr = e.date ? ' data-event-date="' + esc(e.date) + '"' : '';

    if (hasExtra) {
      var extraParts = [];
      if (e.description) {
        e.description.trim().split(/\n\n+/).forEach(function (p) {
          extraParts.push('<p class="event-desc">' + esc(p.trim()) + '</p>');
        });
      }
      if (e.link) {
        extraParts.push('<a class="event-ext-link" href="' + esc(e.link) + '" target="_blank" rel="noopener">Extern länk →</a>');
      }
      return '<details class="event-row"' + idAttr + dateAttr + '><summary>' +
        '<span class="ev-time">' + timeStr + '</span>' +
        '<span class="ev-title">' + esc(e.title) + '</span>' +
        metaEl + '</summary>' +
        '<div class="event-extra">' + extraParts.join('') + '</div>' +
        '</details>';
    } else {
      return '<div class="event-row plain"' + idAttr + dateAttr + '>' +
        '<span class="ev-time">' + timeStr + '</span>' +
        '<span class="ev-title">' + esc(e.title) + '</span>' +
        metaEl + '</div>';
    }
  });

  var output = '<div class="today-card"><div class="event-list">' + rows.join('') + '</div></div>';
  if (showFooter) {
    output += '<p class="display-footer">' + todayEvents.length + ' aktiviteter schemalagda idag.</p>';
  }
  container.innerHTML = output;
}());
