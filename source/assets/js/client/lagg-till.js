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
      errBox.hidden = true;
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
    if (!title)            errs.push('Rubrik är obligatoriskt.');
    if (!date)             errs.push('Datum är obligatoriskt.');
    if (!start)            errs.push('Starttid är obligatorisk.');
    if (!end)              errs.push('Sluttid är obligatorisk.');
    else if (end <= start) errs.push('Sluttid måste vara efter starttid.');
    if (!location)         errs.push('Plats är obligatoriskt.');
    if (!responsible)      errs.push('Ansvarig är obligatoriskt.');

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
