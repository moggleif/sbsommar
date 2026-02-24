(function () {
  'use strict';

  var LS_KEY = 'sb_cookie_consent';

  // Returns 'accepted', 'declined', or null (no decision yet).
  function getConsent() {
    try { return localStorage.getItem(LS_KEY); } catch { return null; }
  }

  function saveConsent(value) {
    try { localStorage.setItem(LS_KEY, value); } catch { /* ignore */ }
  }

  // Show the consent banner above the form.
  // Calls callback(true) when accepted, callback(false) when declined.
  function showConsentBanner(callback) {
    var banner = document.createElement('div');
    banner.className = 'cookie-consent-banner';
    banner.setAttribute('role', 'region');
    banner.setAttribute('aria-label', 'Cookie-samtycke');
    banner.innerHTML =
      '<p>För att du ska kunna redigera din aktivitet senare behöver vi spara ett <strong>sessionscookie</strong> i din webbläsare. Det innehåller bara ett ID för din aktivitet och försvinner automatiskt efter 7 dagar.</p>' +
      '<div class="cookie-consent-actions">' +
        '<button class="btn-primary" id="consent-accept">Ja, det är okej</button>' +
        '<button class="btn-secondary" id="consent-decline">Nej tack</button>' +
      '</div>';

    // Insert before the form
    var form = document.getElementById('event-form');
    if (form && form.parentNode) {
      form.parentNode.insertBefore(banner, form);
    } else {
      document.body.insertBefore(banner, document.body.firstChild);
    }

    document.getElementById('consent-accept').addEventListener('click', function () {
      saveConsent('accepted');
      banner.remove();
      callback(true);
    });

    document.getElementById('consent-decline').addEventListener('click', function () {
      saveConsent('declined');
      banner.remove();
      callback(false);
    });
  }

  // Public API used by lagg-till.js before submitting the form.
  // If a decision already exists, calls callback immediately.
  // Otherwise, shows the banner.
  window.SBConsentReady = function (callback) {
    var existing = getConsent();
    if (existing === 'accepted') { callback(true); return; }
    if (existing === 'declined') { callback(false); return; }
    showConsentBanner(callback);
  };
})();
