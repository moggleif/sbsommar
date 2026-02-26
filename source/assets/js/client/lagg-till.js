(function () {
  'use strict';

  var form         = document.getElementById('event-form');
  var fieldset     = form.querySelector('fieldset');
  var submitBtn    = form.querySelector('button[type="submit"]');
  var modal        = document.getElementById('submit-modal');
  var modalHeading = document.getElementById('modal-heading');
  var modalContent = document.getElementById('modal-content');

  // ── Time-gating (02-§26.3–26.8) ───────────────────────────────────────────

  var opensDate = form.dataset.opens;
  var closesDate = form.dataset.closes;

  if (opensDate && closesDate) {
    var today = new Date().toISOString().slice(0, 10);
    if (today < opensDate) {
      // Before opening
      var parts = opensDate.split('-');
      var months = ['januari','februari','mars','april','maj','juni',
                    'juli','augusti','september','oktober','november','december'];
      var formatted = parseInt(parts[2], 10) + ' ' + months[parseInt(parts[1], 10) - 1] + ' ' + parts[0];
      var msg = document.createElement('div');
      msg.className = 'form-gate-msg';
      msg.textContent = 'Formuläret öppnar den ' + formatted + '.';
      form.parentNode.insertBefore(msg, form);
      fieldset.disabled = true;
      submitBtn.disabled = true;
      form.classList.add('form-gated');
    } else if (today > closesDate) {
      // After closing
      var msg2 = document.createElement('div');
      msg2.className = 'form-gate-msg';
      msg2.textContent = 'Lägret är avslutat.';
      form.parentNode.insertBefore(msg2, form);
      fieldset.disabled = true;
      submitBtn.disabled = true;
      form.classList.add('form-gated');
    }
  }

  // ── Modal helpers ────────────────────────────────────────────────────────────

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
    // Focus first interactive element, or the heading so screen readers
    // announce the modal state even in the loading phase.
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

  // ── Modal states ─────────────────────────────────────────────────────────────

  function setModalLoading() {
    modalHeading.textContent = 'Skickar…';
    modalContent.innerHTML =
      '<div class="modal-spinner" aria-hidden="true"></div>' +
      '<p class="modal-status">Skickar till GitHub…</p>';
    // Open only if not already open (consent modal may have opened it).
    if (modal.hidden) { openModal(); } else { modalHeading.focus(); }
  }

  function setModalSuccess(title, consentGiven) {
    modalHeading.textContent = 'Aktiviteten är tillagd!';
    var noEditNote = consentGiven ? '' :
      '<p class="result-note">Du valde att inte tillåta cookie, så aktiviteten kan inte' +
      ' redigeras från den här webbläsaren. Vill du ändra dig? Lägg till' +
      ' en ny aktivitet och välj <em>Ja, det är okej</em> när vi frågar.</p>';
    modalContent.innerHTML =
      '<p class="intro"><strong>' + escHtml(title) + '</strong>' +
      ' syns i schemat om ungefär en minut.</p>' +
      noEditNote +
      '<div class="success-actions">' +
        '<a href="schema.html" class="btn-primary">Gå till schemat →</a>' +
        '<button id="modal-new-btn" class="btn-secondary">Lägg till en till</button>' +
      '</div>';
    focusFirstInModal();
    document.getElementById('modal-new-btn').addEventListener('click', function () {
      closeModal();
      form.reset();
      clearAllErrors();
      unlock();
      window.scrollTo(0, 0);
    });
  }

  function setModalError(message) {
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

  // ── Form lock / unlock ───────────────────────────────────────────────────────

  function lock() {
    fieldset.disabled = true;
    submitBtn.disabled = true;
  }

  function unlock() {
    fieldset.disabled = false;
    submitBtn.disabled = false;
  }

  // ── Utility ──────────────────────────────────────────────────────────────────

  function escHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // ── Per-field inline errors (02-§6.5) ────────────────────────────────────────

  function setFieldError(name, message) {
    var input = form.querySelector('#f-' + name);
    var span  = document.getElementById('err-' + name);
    if (message) {
      input.setAttribute('aria-invalid', 'true');
      span.textContent = message;
      span.hidden = false;
    } else {
      input.removeAttribute('aria-invalid');
      span.textContent = '';
      span.hidden = true;
    }
  }

  function clearAllErrors() {
    var fields = ['title', 'date', 'start', 'end', 'location', 'responsible'];
    for (var i = 0; i < fields.length; i++) { setFieldError(fields[i], null); }
  }

  // ── Live validation (02-§6.9–6.12) ──────────────────────────────────────────

  var REQUIRED_FIELDS = ['title', 'date', 'start', 'end', 'location', 'responsible'];

  // Clear error as soon as the user starts editing a field again.
  REQUIRED_FIELDS.forEach(function (name) {
    var input = form.querySelector('#f-' + name);
    if (!input) return;
    var clearEvent = (input.tagName === 'SELECT' || input.type === 'date' || input.type === 'time')
      ? 'change' : 'input';
    input.addEventListener(clearEvent, function () {
      setFieldError(name, null);
    });
  });

  // Show error when the user leaves a required field empty (02-§6.11).
  REQUIRED_FIELDS.forEach(function (name) {
    var input = form.querySelector('#f-' + name);
    if (!input) return;
    input.addEventListener('blur', function () {
      if (!input.value) {
        var labels = {
          title:       'Rubrik är obligatoriskt.',
          date:        'Datum är obligatoriskt.',
          start:       'Starttid är obligatorisk.',
          end:         'Sluttid är obligatorisk.',
          location:    'Plats är obligatoriskt.',
          responsible: 'Ansvarig är obligatoriskt.',
        };
        setFieldError(name, labels[name]);
      }
    });
  });

  // Validate date immediately on change (02-§6.9).
  var dateInput = form.querySelector('#f-date');
  if (dateInput) {
    dateInput.addEventListener('change', function () {
      if (!dateInput.value) return; // blur handles the empty case
      var today = new Date().toISOString().slice(0, 10);
      if (dateInput.value < today) {
        setFieldError('date', 'Datum kan inte vara i det förflutna.');
      }
    });
  }

  // Validate end time immediately on change (02-§6.10).
  var endInput = form.querySelector('#f-end');
  if (endInput) {
    endInput.addEventListener('change', function () {
      if (!endInput.value) return; // blur handles the empty case
      var startVal = (form.elements.start || {}).value;
      if (startVal && endInput.value <= startVal) {
        setFieldError('end', 'Sluttid måste vara efter starttid.');
      }
    });
  }

  // ── Submit handler ───────────────────────────────────────────────────────────

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

    var today = new Date().toISOString().slice(0, 10);
    var hasError = false;
    var firstInvalid = null;

    function fail(name, msg) {
      setFieldError(name, msg);
      hasError = true;
      if (!firstInvalid) firstInvalid = form.querySelector('#f-' + name);
    }

    if (!title)            fail('title', 'Rubrik är obligatoriskt.');
    if (!date)             fail('date', 'Datum är obligatoriskt.');
    else if (date < today) fail('date', 'Datum kan inte vara i det förflutna.');
    if (!start)            fail('start', 'Starttid är obligatorisk.');
    if (!end)              fail('end', 'Sluttid är obligatorisk.');
    else if (end <= start) fail('end', 'Sluttid måste vara efter starttid.');
    if (!location)         fail('location', 'Plats är obligatoriskt.');
    if (!responsible)      fail('responsible', 'Ansvarig är obligatoriskt.');

    if (hasError) {
      firstInvalid.focus();
      firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      return;
    }

    lock();

    // Ask for cookie consent before sending (shown once per browser).
    // If window.SBConsentReady is unavailable (cookie-consent.js not loaded),
    // proceed without consent.
    var consentFn = window.SBConsentReady || function (cb) { cb(false); };
    var modalApi = {
      open: openModal,
      setHeading: function (t) { modalHeading.textContent = t; },
      setContent: function (h) { modalContent.innerHTML = h; focusFirstInModal(); },
    };

    consentFn(function (consentGiven) {
      setModalLoading();

      fetch(form.dataset.apiUrl || '/add-event', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title:         title,
          date:          date,
          start:         start,
          end:           end,
          location:      location,
          responsible:   responsible,
          description:   els.description.value,
          link:          els.link.value.trim(),
          cookieConsent: consentGiven,
        }),
      })
        .then(function (r) { return r.json(); })
        .then(function (json) {
          if (!json.success) {
            setModalError(json.error || 'Något gick fel.');
            return;
          }
          setModalSuccess(title, consentGiven);
        })
        .catch(function () {
          setModalError('Något gick fel. Kontrollera din internetanslutning och försök igen.');
        });
    }, modalApi);
  });
})();
