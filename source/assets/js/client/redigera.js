(function () {
  'use strict';

  var COOKIE_NAME = 'sb_session';

  var loadingEl = document.getElementById('edit-loading');
  var errorEl   = document.getElementById('edit-error');
  var errorMsg  = document.getElementById('edit-error-msg');
  var sectionEl = document.getElementById('edit-section');
  var resultEl  = document.getElementById('result');
  var form      = document.getElementById('edit-form');
  var errBox    = document.getElementById('form-errors');
  var submitBtn = form ? form.querySelector('button[type="submit"]') : null;

  // ── Cookie helper ────────────────────────────────────────────────────────────

  function readSessionIds() {
    var pairs = document.cookie.split(';');
    for (var i = 0; i < pairs.length; i++) {
      var pair = pairs[i].trim();
      if (pair.indexOf(COOKIE_NAME + '=') === 0) {
        try {
          var raw = pair.slice(COOKIE_NAME.length + 1);
          var parsed = JSON.parse(decodeURIComponent(raw));
          if (Array.isArray(parsed)) return parsed;
        } catch { /* ignore */ }
        return [];
      }
    }
    return [];
  }

  // ── Error display ────────────────────────────────────────────────────────────

  function showError(msg) {
    loadingEl.hidden = true;
    errorMsg.textContent = msg || 'Aktiviteten kunde inte laddas.';
    errorEl.hidden = false;
  }

  // ── URL param helper ─────────────────────────────────────────────────────────

  function getParam(name) {
    var params = new URLSearchParams(window.location.search);
    return params.get(name);
  }

  // ── Pre-populate form ────────────────────────────────────────────────────────

  function populate(event) {
    var els = form.elements;
    els.id.value = event.id || '';
    els.title.value = event.title || '';
    els.date.value = event.date || '';
    els.start.value = event.start || '';
    els.end.value = event.end || '';
    els.location.value = event.location || '';
    els.responsible.value = event.responsible || '';
    els.description.value = event.description || '';
    els.link.value = event.link || '';
  }

  // ── Init ─────────────────────────────────────────────────────────────────────

  var eventId = getParam('id');
  var today = new Date().toISOString().slice(0, 10);

  if (!eventId) {
    showError('Inget aktivitets-ID angivet.');
    return;
  }

  var ownedIds = readSessionIds();
  if (ownedIds.indexOf(eventId) === -1) {
    showError('Du har inte rättighet att redigera denna aktivitet.');
    return;
  }

  // Fetch events.json to verify the event exists and hasn't passed.
  fetch('/events.json')
    .then(function (r) { return r.json(); })
    .then(function (events) {
      var event = null;
      for (var i = 0; i < events.length; i++) {
        if (events[i].id === eventId) { event = events[i]; break; }
      }

      if (!event) {
        showError('Aktiviteten hittades inte i det aktuella schemat.');
        return;
      }

      if (event.date < today) {
        showError('Aktiviteten har redan ägt rum och kan inte redigeras.');
        return;
      }

      populate(event);
      loadingEl.hidden = true;
      sectionEl.hidden = false;
    })
    .catch(function () {
      showError('Kunde inte hämta schemadata. Kontrollera din internetanslutning.');
    });

  // ── Form submission ──────────────────────────────────────────────────────────

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var els         = form.elements;
      var title       = els.title.value.trim();
      var date        = els.date.value;
      var start       = els.start.value;
      var end         = els.end.value;
      var location    = els.location.value;
      var responsible = els.responsible.value.trim();

      var errs = [];
      if (!title)       errs.push('Rubrik är obligatoriskt.');
      if (!date)        errs.push('Datum är obligatoriskt.');
      if (!start)       errs.push('Starttid är obligatorisk.');
      if (end && end <= start) errs.push('Sluttid måste vara efter starttid.');
      if (!location)    errs.push('Plats är obligatoriskt.');
      if (!responsible) errs.push('Ansvarig är obligatoriskt.');

      if (errs.length) {
        errBox.hidden = false;
        errBox.innerHTML = errs.map(function (m) { return '<p>' + m + '</p>'; }).join('');
        errBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        return;
      }

      errBox.hidden = true;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sparar...';

      fetch(form.dataset.apiUrl || '/edit-event', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id:          els.id.value,
          title:       title,
          date:        date,
          start:       start,
          end:         end,
          location:    location,
          responsible: responsible,
          description: els.description.value,
          link:        els.link.value.trim(),
        }),
      })
        .then(function (r) { return r.json(); })
        .then(function (json) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Spara ändringar →';

          if (!json.success) {
            errBox.hidden = false;
            errBox.innerHTML = '<p>' + (json.error || 'Något gick fel.') + '</p>';
            return;
          }

          var titleEl = document.getElementById('result-title');
          if (titleEl) titleEl.textContent = title;
          sectionEl.hidden = true;
          resultEl.hidden = false;
          window.scrollTo(0, 0);
        })
        .catch(function () {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Spara ändringar →';
          errBox.hidden = false;
          errBox.innerHTML = '<p>Något gick fel. Kontrollera din internetanslutning och försök igen.</p>';
        });
    });
  }
})();
