(function () {
  'use strict';

  var form      = document.getElementById('event-form');
  var result    = document.getElementById('result');
  var errBox    = document.getElementById('form-errors');
  var newBtn    = document.getElementById('new-btn');
  var submitBtn = form.querySelector('button[type="submit"]');

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
    if (!end)         errs.push('Sluttid är obligatorisk.');
    else if (end <= start) errs.push('Sluttid måste vara efter starttid.');
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

    // Ask for cookie consent before sending (shown once per browser).
    // If window.SBConsentReady is unavailable (cookie-consent.js not loaded),
    // proceed without consent.
    var consentFn = window.SBConsentReady || function (cb) { cb(false); };

    consentFn(function (consentGiven) {
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
          submitBtn.disabled = false;
          submitBtn.textContent = 'Skicka →';

          if (!json.success) {
            errBox.hidden = false;
            errBox.innerHTML = '<p>' + (json.error || 'Något gick fel.') + '</p>';
            return;
          }

          var titleEl = document.getElementById('result-title');
          if (titleEl) titleEl.textContent = title;

          // If the user declined cookie consent, surface a note so they know
          // they won't be able to edit the activity later from this browser.
          var noEditNote = document.getElementById('result-no-edit-note');
          if (noEditNote) noEditNote.hidden = consentGiven;

          form.hidden = true;
          result.hidden = false;
          window.scrollTo(0, 0);
        })
        .catch(function () {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Skicka →';
          errBox.hidden = false;
          errBox.innerHTML = '<p>Något gick fel. Kontrollera din internetanslutning och försök igen.</p>';
        });
    });
  });

  newBtn.addEventListener('click', function () {
    form.reset();
    form.hidden = false;
    result.hidden = true;
    errBox.hidden = true;
    window.scrollTo(0, 0);
  });
})();
