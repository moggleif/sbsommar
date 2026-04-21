/* global marked, MarkdownRenderers */
'use strict';

// Live Markdown preview for the description textarea (02-§58.1–58.15).
//
// Loaded after marked.umd.js and markdown-renderers.js, so the global
// `marked` namespace and `MarkdownRenderers` factory are available. The
// preview uses the same sanitizing renderer overrides that the build
// uses, so `/lagg-till.html` and `/redigera.html` show byte-for-byte the
// same HTML the build will eventually publish (02-§58.8).

if (typeof window !== 'undefined') {
  (function () {
    var debounceTimer = null;
    var DEBOUNCE_MS = 300;

    document.addEventListener('DOMContentLoaded', function () {
      var textarea = document.getElementById('f-description');
      if (!textarea) return;

      var preview = document.querySelector('.md-preview');
      if (!preview) return;

      var contentEl = preview.querySelector('.md-preview-content');
      if (!contentEl) return;

      if (typeof marked === 'undefined' || !marked.Marked) return;
      if (typeof MarkdownRenderers === 'undefined') return;

      var md = new marked.Marked({ renderer: MarkdownRenderers.renderers });

      function render() {
        var text = textarea.value.trim();
        if (!text) {
          preview.hidden = true;
          contentEl.innerHTML = '';
          return;
        }

        contentEl.innerHTML = md.parse(text);
        preview.hidden = false;
      }

      textarea.addEventListener('input', function () {
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(render, DEBOUNCE_MS);
      });

      render();
    });
  })();
}
