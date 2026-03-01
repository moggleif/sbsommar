(function () {
  'use strict';

  var FLAG = 'sb_wp_cleanup_done';
  try { if (localStorage.getItem(FLAG) === '2') return; } catch { return; }

  // Known WordPress / Blocksy / EME cookie prefixes left over from the
  // previous site.  These can interfere with the new session cookie.
  var prefixes = ['PHPSESSID', 'wordpress_', 'wp_', 'wp-', 'eme_', 'blocksy_'];

  // Phase 1: delete non-HttpOnly cookies via JavaScript.
  document.cookie.split(';').forEach(function (pair) {
    var name = pair.trim().split('=')[0];
    for (var i = 0; i < prefixes.length; i++) {
      if (name === prefixes[i] || name.indexOf(prefixes[i]) === 0) {
        document.cookie = name + '=; Path=/; Max-Age=0';
        document.cookie = name + '=; Path=/; Max-Age=0; Domain=' + location.hostname;
        document.cookie = name + '=; Path=/; Max-Age=0; Domain=.' + location.hostname;
        break;
      }
    }
  });

  // Phase 2: ask the server to expire HttpOnly cookies that JS cannot touch.
  fetch('/api/cleanup-cookies', { credentials: 'include' })
    .then(function () {
      try { localStorage.setItem(FLAG, '2'); } catch { /* ignore */ }
    })
    .catch(function () {
      // Mark as done even on failure to avoid repeated requests.
      try { localStorage.setItem(FLAG, '2'); } catch { /* ignore */ }
    });
})();
