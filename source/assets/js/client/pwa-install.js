(function () {
  'use strict';

  // Do not show in standalone mode (already installed).
  if (window.matchMedia('(display-mode: standalone)').matches) return;
  if (window.navigator.standalone) return; // iOS standalone

  var btn = document.querySelector('.pwa-install-btn');
  if (!btn) return;

  btn.title = 'Installera appen';

  var deferredPrompt = null;
  var isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent) && !window.MSStream;

  // ── beforeinstallprompt (Chrome/Edge) ───────────────────────────────────

  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    deferredPrompt = e;
    btn.hidden = false;
  });

  // ── appinstalled ────────────────────────────────────────────────────────

  window.addEventListener('appinstalled', function () {
    btn.hidden = true;
    deferredPrompt = null;
  });

  // ── iOS detection ───────────────────────────────────────────────────────

  if (isIOS) {
    btn.hidden = false;
  }

  // ── Button click ────────────────────────────────────────────────────────

  btn.addEventListener('click', function () {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(function () {
        deferredPrompt = null;
      });
      return;
    }

    if (isIOS) {
      showIOSTooltip();
      return;
    }
  });

  // ── iOS tooltip ─────────────────────────────────────────────────────────

  var tooltip = null;

  function showIOSTooltip() {
    if (tooltip) {
      removeTooltip();
      return;
    }

    tooltip = document.createElement('div');
    tooltip.className = 'pwa-install-tooltip';
    tooltip.textContent =
      'Tryck på Dela-ikonen och välj \u201cLägg till på hemskärmen\u201d';
    btn.parentNode.appendChild(tooltip);

    // Close on outside click (delayed to avoid immediate close).
    setTimeout(function () {
      document.addEventListener('click', onOutsideClick);
      document.addEventListener('keydown', onEscape);
    }, 0);
  }

  function removeTooltip() {
    if (tooltip && tooltip.parentNode) {
      tooltip.parentNode.removeChild(tooltip);
    }
    tooltip = null;
    document.removeEventListener('click', onOutsideClick);
    document.removeEventListener('keydown', onEscape);
  }

  function onOutsideClick(e) {
    if (tooltip && !tooltip.contains(e.target) && e.target !== btn) {
      removeTooltip();
    }
  }

  function onEscape(e) {
    if (e.key === 'Escape') {
      removeTooltip();
    }
  }
})();
