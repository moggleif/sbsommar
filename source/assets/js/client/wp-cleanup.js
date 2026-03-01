(function () {
  'use strict';

  var FLAG = 'sb_wp_cleanup_done';
  try { if (localStorage.getItem(FLAG)) return; } catch { return; }

  // Known WordPress / Blocksy / EME cookie prefixes left over from the
  // previous site.  These can interfere with the new session cookie.
  var prefixes = ['PHPSESSID', 'wordpress_', 'wp_', 'wp-', 'eme_', 'blocksy_'];

  document.cookie.split(';').forEach(function (pair) {
    var name = pair.trim().split('=')[0];
    for (var i = 0; i < prefixes.length; i++) {
      if (name === prefixes[i] || name.indexOf(prefixes[i]) === 0) {
        // Delete by setting Max-Age=0 for common path/domain combos.
        document.cookie = name + '=; Path=/; Max-Age=0';
        document.cookie = name + '=; Path=/; Max-Age=0; Domain=' + location.hostname;
        document.cookie = name + '=; Path=/; Max-Age=0; Domain=.' + location.hostname;
        break;
      }
    }
  });

  try { localStorage.setItem(FLAG, '1'); } catch { /* ignore */ }
})();
