(function () {
  'use strict';

  var COOKIE_NAME = 'sb_session';
  var MAX_AGE_SECONDS = 7 * 24 * 60 * 60; // 7 days

  // Read the cookie domain injected at build time (02-§18.47).
  // Must match the Domain the server uses when setting the cookie.
  var cookieDomain = (document.body.dataset.cookieDomain || '').trim();
  var domainPart = cookieDomain ? '; Domain=' + cookieDomain : '';

  // ── Cookie helpers ──────────────────────────────────────────────────────────

  function readSessionIds() {
    var pairs = document.cookie.split(';');
    for (var i = 0; i < pairs.length; i++) {
      var pair = pairs[i].trim();
      if (pair.indexOf(COOKIE_NAME + '=') === 0) {
        try {
          var raw = pair.slice(COOKIE_NAME.length + 1);
          var parsed = JSON.parse(decodeURIComponent(raw));
          if (Array.isArray(parsed)) {
            return parsed.filter(function (id) { return typeof id === 'string' && id.length > 0; });
          }
        } catch { /* malformed — ignore */ }
        return [];
      }
    }
    return [];
  }

  function writeSessionIds(ids) {
    if (!ids || ids.length === 0) {
      // Delete the cookie by setting Max-Age=0
      document.cookie = COOKIE_NAME + '=; Path=/; Max-Age=0; Secure; SameSite=Strict' + domainPart;
      return;
    }
    var value = encodeURIComponent(JSON.stringify(ids));
    document.cookie = COOKIE_NAME + '=' + value +
      '; Path=/; Max-Age=' + MAX_AGE_SECONDS + '; Secure; SameSite=Strict' + domainPart;
  }

  // ── Expiry cleanup ──────────────────────────────────────────────────────────

  // Remove IDs for events whose date is strictly before today.
  // IDs not found in events.json are kept — a newly-submitted event may not
  // yet appear because the event-data deploy is still in progress (02-§18.49).
  function removeExpiredIds(ids, events) {
    var today = new Date().toISOString().slice(0, 10);
    return ids.filter(function (id) {
      var ev = events[id];
      if (!ev) return true; // unknown — keep (deploy may be in progress)
      return ev.date >= today;
    });
  }

  // Build a lookup map from event ID → event object.
  function buildEventMap(eventsArray) {
    var map = {};
    if (!Array.isArray(eventsArray)) return map;
    eventsArray.forEach(function (e) {
      if (e && e.id) map[e.id] = e;
    });
    return map;
  }

  // ── Edit link injection ─────────────────────────────────────────────────────

  function injectEditLinks(ownedIds) {
    if (!ownedIds.length) return;
    var today = new Date().toISOString().slice(0, 10);

    ownedIds.forEach(function (id) {
      var rows = document.querySelectorAll('[data-event-id="' + CSS.escape(id) + '"]');
      rows.forEach(function (row) {
        // Only inject if the event date hasn't passed.
        var date = row.getAttribute('data-event-date');
        if (date && date < today) return;

        var link = document.createElement('a');
        link.href = 'redigera.html?id=' + encodeURIComponent(id);
        link.textContent = 'Redigera';
        link.className = 'edit-link';

        // For <details> rows the link must go inside <summary> so it is
        // visible when collapsed, not hidden in the expandable body.
        var target = (row.tagName === 'DETAILS')
          ? row.querySelector('summary')
          : row;
        (target || row).appendChild(link);
      });
    });
  }

  // ── Main ────────────────────────────────────────────────────────────────────

  var ids = readSessionIds();
  if (!ids.length) return;

  // Fetch events.json to validate dates and clean up expired IDs.
  fetch('/events.json')
    .then(function (r) { return r.json(); })
    .then(function (eventsArray) {
      var eventMap = buildEventMap(eventsArray);
      var active = removeExpiredIds(ids, eventMap);

      // Persist the cleaned list back.
      writeSessionIds(active);

      injectEditLinks(active);
    })
    .catch(function () {
      // If events.json is unavailable, still inject links for what we have.
      injectEditLinks(ids);
    });
})();
