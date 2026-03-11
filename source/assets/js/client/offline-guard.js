(function () {
  'use strict';

  var BANNER_ID = 'offline-guard-banner';
  var MSG = 'Du är offline. Formuläret kräver internetanslutning för att skicka.';

  function getSubmitButtons() {
    return document.querySelectorAll('button[type="submit"]');
  }

  function showBanner() {
    if (document.getElementById(BANNER_ID)) return;
    var banner = document.createElement('p');
    banner.id = BANNER_ID;
    banner.className = 'form-error-msg';
    banner.setAttribute('role', 'alert');
    banner.textContent = MSG;
    // Insert before the first form on the page.
    var form = document.querySelector('form');
    if (form) {
      form.parentNode.insertBefore(banner, form);
    }
  }

  function hideBanner() {
    var banner = document.getElementById(BANNER_ID);
    if (banner) banner.remove();
  }

  function disableSubmit() {
    var btns = getSubmitButtons();
    for (var i = 0; i < btns.length; i++) {
      btns[i].disabled = true;
      btns[i].dataset.offlineDisabled = 'true';
    }
  }

  function enableSubmit() {
    var btns = getSubmitButtons();
    for (var i = 0; i < btns.length; i++) {
      if (btns[i].dataset.offlineDisabled === 'true') {
        btns[i].disabled = false;
        delete btns[i].dataset.offlineDisabled;
      }
    }
  }

  function onOffline() {
    showBanner();
    disableSubmit();
  }

  function onOnline() {
    hideBanner();
    enableSubmit();
  }

  // Check initial state.
  if (!navigator.onLine) {
    onOffline();
  }

  window.addEventListener('offline', onOffline);
  window.addEventListener('online', onOnline);
})();
