(function () {
  'use strict';

  var form         = document.getElementById('event-form');
  var fieldset     = form.querySelector('fieldset');
  var errBox       = document.getElementById('form-errors');
  var submitBtn    = form.querySelector('button[type="submit"]');
  var modal        = document.getElementById('submit-modal');
  var modalHeading = document.getElementById('modal-heading');
  var modalContent = document.getElementById('modal-content');

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
    modalHeading.textContent = 'Skickar\u2026';
    modalContent.innerHTML =
      '<div class="modal-spinner" aria-hidden="true"></div>' +
      '<p class="modal-status">Skickar till GitHub\u2026</p>';
    openModal();
  }

  function setModalSuccess(title, consentGiven) {
    modalHeading.textContent = 'Aktiviteten \u00e4r tillagd!';
    var noEditNote = consentGiven ? '' :
      '<p class="result-note">Du valde att inte till\u00e5ta cookie, s\u00e5 aktiviteten kan inte' +
      ' redigeras fr\u00e5n den h\u00e4r webbl\u00e4saren. Vill du \u00e4ndra dig? L\u00e4gg till' +
      ' en ny aktivitet och v\u00e4lj <em>Ja, det \u00e4r okej</em> n\u00e4r vi fr\u00e5gar.</p>';
    modalContent.innerHTML =
      '<p class="intro"><strong>' + escHtml(title) + '</strong>' +
      ' syns i schemat om ungef\u00e4r en minut.</p>' +
      noEditNote +
      '<div class="success-actions">' +
        '<a href="schema.html" class="btn-primary">G\u00e5 till schemat \u2192</a>' +
        '<button id="modal-new-btn" class="btn-secondary">L\u00e4gg till en till</button>' +
      '</div>';
    document.getElementById('modal-new-btn').addEventListener('click', function () {
      closeModal();
      form.reset();
      unlock();
      window.scrollTo(0, 0);
    });
  }

  function setModalError(message) {
    modalHeading.textContent = 'N\u00e5got gick fel';
    modalContent.innerHTML =
      '<p class="form-error-msg">' + escHtml(message) + '</p>' +
      '<button id="modal-retry-btn" class="btn-primary">F\u00f6rs\u00f6k igen</button>';
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

  // ── Submit handler ───────────────────────────────────────────────────────────

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
    if (!title)            errs.push('Rubrik \u00e4r obligatoriskt.');
    if (!date)             errs.push('Datum \u00e4r obligatoriskt.');
    if (!start)            errs.push('Starttid \u00e4r obligatorisk.');
    if (!end)              errs.push('Sluttid \u00e4r obligatorisk.');
    else if (end <= start) errs.push('Sluttid m\u00e5ste vara efter starttid.');
    if (!location)         errs.push('Plats \u00e4r obligatoriskt.');
    if (!responsible)      errs.push('Ansvarig \u00e4r obligatoriskt.');

    if (errs.length) {
      errBox.hidden = false;
      errBox.innerHTML = errs.map(function (m) { return '<p>' + m + '</p>'; }).join('');
      errBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      return;
    }

    errBox.hidden = true;
    lock();

    // Ask for cookie consent before sending (shown once per browser).
    // If window.SBConsentReady is unavailable (cookie-consent.js not loaded),
    // proceed without consent.
    var consentFn = window.SBConsentReady || function (cb) { cb(false); };

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
            setModalError(json.error || 'N\u00e5got gick fel.');
            return;
          }
          setModalSuccess(title, consentGiven);
        })
        .catch(function () {
          setModalError(
            'N\u00e5got gick fel. Kontrollera din internetanslutning och f\u00f6rs\u00f6k igen.',
          );
        });
    });
  });
})();
