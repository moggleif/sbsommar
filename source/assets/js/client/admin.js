(function () {
  'use strict';

  var STORAGE_KEY = 'sb_admin';
  var TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

  // ── Helpers ────────────────────────────────────────────────────────────────

  function getAdminData() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  function isExpired(data) {
    if (!data || typeof data.activated !== 'number') return true;
    return (Date.now() - data.activated) > TTL_MS;
  }

  // ── Footer status icon ─────────────────────────────────────────────────────
  // Runs on every page that includes this script (via the footer).

  function renderFooterIcon() {
    var container = document.getElementById('admin-status');
    if (!container) return;

    var data = getAdminData();
    if (!data) {
      // No token → show nothing (02-§91.20)
      container.innerHTML = '';
      return;
    }

    if (isExpired(data)) {
      // Expired → open lock, link to /admin.html (02-§91.22)
      container.innerHTML = '<a href="admin.html" class="admin-icon admin-icon--expired" title="Admin utgången">' +
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">' +
        '<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>' +
        '<path d="M7 11V7a5 5 0 0 1 9.9-1"/>' +
        '</svg></a>';
    } else {
      // Valid → filled lock (02-§91.21)
      container.innerHTML = '<span class="admin-icon admin-icon--active" title="Admin aktiv">' +
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">' +
        '<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>' +
        '<path d="M7 11V7a5 5 0 0 1 10 0v4"/>' +
        '</svg></span>';
    }
  }

  // ── Activation form (only on /admin.html) ──────────────────────────────────

  var form = document.getElementById('admin-form');
  if (form) {
    var input = document.getElementById('admin-token');
    var message = document.getElementById('admin-message');

    // Pre-fill status if already activated
    var existing = getAdminData();
    if (existing && !isExpired(existing)) {
      message.textContent = 'Admin-token är redan aktiv.';
      message.hidden = false;
      message.classList.add('admin-message--success');
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var token = (input.value || '').trim();
      if (!token) return;

      message.hidden = true;
      message.classList.remove('admin-message--success', 'admin-message--error');

      // Derive API URL from the page's API configuration
      var apiBase = '';
      var feedbackBtn = document.querySelector('.feedback-btn[data-api-url]');
      if (feedbackBtn) {
        apiBase = feedbackBtn.dataset.apiUrl.replace(/\/feedback$/, '');
      }
      var verifyUrl = apiBase ? apiBase + '/verify-admin' : '/verify-admin';

      fetch(verifyUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: token }),
      })
        .then(function (res) { return res.json(); })
        .then(function (data) {
          if (data.valid) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({
              token: token,
              activated: Date.now(),
            }));
            message.textContent = 'Admin-token aktiverad!';
            message.classList.add('admin-message--success');
            message.hidden = false;
            renderFooterIcon();
          } else {
            message.textContent = 'Ogiltig token. Försök igen.';
            message.classList.add('admin-message--error');
            message.hidden = false;
          }
        })
        .catch(function () {
          message.textContent = 'Kunde inte verifiera token. Kontrollera din anslutning.';
          message.classList.add('admin-message--error');
          message.hidden = false;
        });
    });
  }

  // Run footer icon on page load
  renderFooterIcon();
})();
