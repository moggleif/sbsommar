(function () {
  'use strict';

  var COOKIE_NAME = 'sb_session';

  var loadingEl    = document.getElementById('edit-loading');
  var errorEl      = document.getElementById('edit-error');
  var errorMsg     = document.getElementById('edit-error-msg');
  var sectionEl    = document.getElementById('edit-section');
  var noSessionEl  = document.getElementById('edit-no-session');
  var myEventsEl   = document.getElementById('edit-my-events');
  var myEventsList = document.getElementById('my-events-list');
  var myEventsEmpty = document.getElementById('my-events-empty');
  var form         = document.getElementById('edit-form');
  var fieldset     = form ? form.querySelector('fieldset') : null;
  var submitBtn    = form ? form.querySelector('button[type="submit"]') : null;
  var modal        = document.getElementById('submit-modal');
  var modalHeading = document.getElementById('modal-heading');
  var modalContent = document.getElementById('modal-content');

  // ── Utility ──────────────────────────────────────────────────────────────────

  function escHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // ── Modal helpers ─────────────────────────────────────────────────────────────

  var preFocusEl = null;

  function getFocusable() {
    return Array.from(
      modal.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'),
    );
  }

  function trapFocus(e) {
    if (e.key !== 'Tab') return;
    var focusable = getFocusable();
    if (!focusable.length) return;
    var first = focusable[0];
    var last  = focusable[focusable.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus(); }
    } else {
      if (document.activeElement === last)  { e.preventDefault(); first.focus(); }
    }
  }

  function openModal() {
    preFocusEl = document.activeElement;
    modal.hidden = false;
    document.body.classList.add('modal-open');
    modal.addEventListener('keydown', trapFocus);
    var focusable = getFocusable();
    if (focusable.length) { focusable[0].focus(); } else { modalHeading.focus(); }
  }

  function focusFirstInModal() {
    var focusable = getFocusable();
    if (focusable.length) focusable[0].focus();
  }

  function closeModal() {
    modal.hidden = true;
    document.body.classList.remove('modal-open');
    modal.removeEventListener('keydown', trapFocus);
    if (preFocusEl) preFocusEl.focus();
  }

  // ── Progress steps (02-§53.6–53.11) ─────────────────────────────────────────

  var PROGRESS_STEPS = [
    { text: 'Skickar till servern\u2026', delay: 0 },
    { text: 'Kontrollerar aktiviteten\u2026', delay: 500 },
    { text: 'Sparar aktiviteten\u2026', delay: 2000 },
  ];

  var progressTimers = [];

  function buildProgressHtml() {
    var html = '<ul class="submit-progress" role="status" aria-live="polite">';
    for (var i = 0; i < PROGRESS_STEPS.length; i++) {
      html += '<li class="progress-step" id="progress-step-' + i + '">' +
        '<span class="step-icon" aria-hidden="true">\u25CB</span> ' +
        '<span class="step-text">' + PROGRESS_STEPS[i].text + '</span></li>';
    }
    html += '</ul>';
    return html;
  }

  function activateStep(index) {
    var el = document.getElementById('progress-step-' + index);
    if (!el) return;
    el.classList.add('step-active');
    el.querySelector('.step-icon').textContent = '\u25C9';
  }

  function completeStep(index) {
    var el = document.getElementById('progress-step-' + index);
    if (!el) return;
    el.classList.remove('step-active');
    el.classList.add('step-done');
    el.querySelector('.step-icon').textContent = '\u2713';
  }

  function completeAllSteps() {
    for (var i = 0; i < PROGRESS_STEPS.length; i++) {
      completeStep(i);
    }
  }

  function clearProgressTimers() {
    for (var i = 0; i < progressTimers.length; i++) {
      clearTimeout(progressTimers[i]);
    }
    progressTimers = [];
  }

  // ── Modal states ──────────────────────────────────────────────────────────────

  function setModalLoading() {
    modalHeading.textContent = 'Sparar\u2026';
    modalContent.innerHTML = buildProgressHtml();
    activateStep(0);

    for (var i = 1; i < PROGRESS_STEPS.length; i++) {
      (function (prev, curr, delay) {
        progressTimers.push(setTimeout(function () {
          completeStep(prev);
          activateStep(curr);
        }, delay));
      })(i - 1, i, PROGRESS_STEPS[i].delay);
    }

    openModal();
  }

  function setModalSuccess(title) {
    clearProgressTimers();
    completeAllSteps();
    modalHeading.textContent = 'Aktiviteten är uppdaterad!';
    modalContent.innerHTML =
      '<p class="intro"><strong>' + escHtml(title) + '</strong>' +
      ' syns i schemat om ungefär en minut.</p>' +
      '<div class="success-actions">' +
        '<a href="schema.html" class="btn-primary">Gå till schemat →</a>' +
      '</div>';
    focusFirstInModal();
  }

  function setModalError(message) {
    clearProgressTimers();
    modalHeading.textContent = 'Något gick fel';
    modalContent.innerHTML =
      '<p class="form-error-msg">' + escHtml(message) + '</p>' +
      '<button id="modal-retry-btn" class="btn-primary">Försök igen</button>';
    focusFirstInModal();
    document.getElementById('modal-retry-btn').addEventListener('click', function () {
      closeModal();
      unlock();
      submitBtn.focus();
    });
  }

  // ── Form lock / unlock ────────────────────────────────────────────────────────

  function lock() {
    fieldset.disabled = true;
    submitBtn.disabled = true;
  }

  function unlock() {
    fieldset.disabled = false;
    submitBtn.disabled = false;
  }

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

    // Trigger preview update after populating description (02-§58.1)
    els.description.dispatchEvent(new Event('input', { bubbles: true }));
  }

  // ── Time-gating (02-§26.9) ──────────────────────────────────────────────────

  if (form) {
    var opensDate = form.dataset.opens;
    var closesDate = form.dataset.closes;

    if (opensDate && closesDate) {
      var todayGate = new Date().toISOString().slice(0, 10);
      if (todayGate < opensDate) {
        var parts = opensDate.split('-');
        var months = ['januari','februari','mars','april','maj','juni',
                      'juli','augusti','september','oktober','november','december'];
        var formatted = parseInt(parts[2], 10) + ' ' + months[parseInt(parts[1], 10) - 1] + ' ' + parts[0];
        loadingEl.hidden = true;
        errorMsg.textContent = 'Formuläret öppnar den ' + formatted + '.';
        errorEl.hidden = false;
        return;
      } else if (todayGate > closesDate) {
        loadingEl.hidden = true;
        errorMsg.textContent = 'Lägret är avslutat.';
        errorEl.hidden = false;
        return;
      }
    }
  }

  // ── Event list helper (02-§48.13–48.18) ─────────────────────────────────────

  function renderMyEvents(events, ownedIds, today) {
    var editable = [];
    for (var i = 0; i < events.length; i++) {
      var ev = events[i];
      if (ownedIds.indexOf(ev.id) !== -1 && ev.date >= today) {
        editable.push(ev);
      }
    }
    if (editable.length === 0) {
      if (myEventsEmpty) myEventsEmpty.hidden = false;
      if (myEventsList) myEventsList.hidden = true;
      return editable;
    }
    if (myEventsEmpty) myEventsEmpty.hidden = true;
    if (myEventsList) {
      myEventsList.innerHTML = '';
      for (var j = 0; j < editable.length; j++) {
        var li = document.createElement('li');
        var a = document.createElement('a');
        a.href = 'redigera.html?id=' + encodeURIComponent(editable[j].id);
        a.textContent = editable[j].title;
        li.appendChild(a);
        myEventsList.appendChild(li);
      }
      myEventsList.hidden = false;
    }
    return editable;
  }

  // ── Init ─────────────────────────────────────────────────────────────────────

  var eventId = getParam('id');
  var today = new Date().toISOString().slice(0, 10);
  var ownedIds = readSessionIds();

  if (!eventId) {
    // No specific event selected — show browse mode
    loadingEl.hidden = true;

    if (ownedIds.length === 0) {
      // No cookie — show explanation (02-§48.8)
      if (noSessionEl) noSessionEl.hidden = false;
      return;
    }

    // Has cookie — fetch events and show list (02-§48.13)
    if (myEventsEl) myEventsEl.hidden = false;
    fetch('/events.json')
      .then(function (r) { return r.json(); })
      .then(function (events) {
        renderMyEvents(events, ownedIds, today);
      })
      .catch(function () {
        if (myEventsEmpty) myEventsEmpty.textContent = 'Kunde inte hämta schemadata.';
      });
    return;
  }

  // Specific event selected — existing edit behaviour (02-§48.17)
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

      // Show event list above form if user has other events (02-§48.18)
      if (myEventsEl) {
        var editable = renderMyEvents(events, ownedIds, today);
        if (editable.length > 0) myEventsEl.hidden = false;
      }

      populate(event);
      loadingEl.hidden = true;
      sectionEl.hidden = false;
    })
    .catch(function () {
      showError('Kunde inte hämta schemadata. Kontrollera din internetanslutning.');
    });

  // ── Per-field inline errors (02-§6.5) ──────────────────────────────────────

  function setFieldError(name, message) {
    var input = form.querySelector('#f-' + name);
    var span  = document.getElementById('err-' + name);
    if (message) {
      input.setAttribute('aria-invalid', 'true');
      span.className = 'field-error';
      span.textContent = message;
      span.hidden = false;
    } else {
      input.removeAttribute('aria-invalid');
      span.className = 'field-error';
      span.textContent = '';
      span.hidden = true;
    }
  }

  function timeToMinutes(hhmm) {
    var parts = hhmm.split(':');
    return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
  }

  // Returns { state: 'ok'|'info'|'error', message: string|null }
  function checkEndTime(startVal, endVal) {
    if (endVal === startVal) return { state: 'error', message: 'Sluttid måste vara efter starttid.' };
    if (endVal > startVal) return { state: 'ok', message: null };
    var dur = (1440 - timeToMinutes(startVal)) + timeToMinutes(endVal);
    if (dur <= 1020) return { state: 'info', message: 'Tolkas som att aktiviteten slutar nästa dag.' };
    return { state: 'error', message: 'Aktiviteten verkar vara för lång. Kontrollera start- och sluttid.' };
  }

  function clearAllErrors() {
    var fields = ['title', 'date', 'start', 'end', 'location', 'responsible'];
    for (var i = 0; i < fields.length; i++) { setFieldError(fields[i], null); }
  }

  // ── Form submission ──────────────────────────────────────────────────────────

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      clearAllErrors();

      var els         = form.elements;
      var title       = els.title.value.trim();
      var date        = els.date.value;
      var start       = els.start.value;
      var end         = els.end.value;
      var location    = els.location.value;
      var responsible = els.responsible.value.trim();

      var submitToday = new Date().toISOString().slice(0, 10);
      var hasError = false;
      var firstInvalid = null;

      function fail(name, msg) {
        setFieldError(name, msg);
        hasError = true;
        if (!firstInvalid) firstInvalid = form.querySelector('#f-' + name);
      }

      if (!title)              fail('title', 'Rubrik är obligatoriskt.');
      if (!date)               fail('date', 'Datum är obligatoriskt.');
      else if (date < submitToday) fail('date', 'Datum kan inte vara i det förflutna.');
      if (!start)              fail('start', 'Starttid är obligatorisk.');
      if (!end)                fail('end', 'Sluttid är obligatorisk.');
      else if (start) {
        var endResult = checkEndTime(start, end);
        if (endResult.state === 'error') fail('end', endResult.message);
      }
      if (!location)    fail('location', 'Plats är obligatoriskt.');
      if (!responsible) fail('responsible', 'Ansvarig är obligatoriskt.');

      if (hasError) {
        firstInvalid.focus();
        firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        return;
      }

      lock();
      setModalLoading();

      fetch(form.dataset.apiUrl || '/edit-event', {
        method: 'POST',
        credentials: 'include',
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
          if (!json.success) {
            setModalError(json.error || 'Något gick fel.');
            return;
          }
          setModalSuccess(title);
        })
        .catch(function () {
          setModalError('Något gick fel. Kontrollera din internetanslutning och försök igen.');
        });
    });
  }
})();
