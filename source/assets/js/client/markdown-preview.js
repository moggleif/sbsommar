/* global marked */
'use strict';

// Live Markdown preview for the description textarea (02-§58.1–58.15).
//
// Requires marked.umd.js to be loaded before this script.
// Renders the textarea content through marked.parse() and sanitizes the
// output using the same rules as the build-time renderer (02-§56.6).

// ── Sanitization (identical to source/build/markdown.js) ────────────────────

var DANGEROUS_TAG_RE = /<\/?\s*(script|iframe|object|embed)\b[^>]*>/gi;
var EVENT_HANDLER_RE = /\s+on\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]*)/gi;
var JS_URI_RE = /(href|src)\s*=\s*(["'])javascript:[^"']*\2/gi;

function sanitizeHtml(html) {
  var result = html;
  var prev;
  do {
    prev = result;
    result = result
      .replace(DANGEROUS_TAG_RE, '')
      .replace(EVENT_HANDLER_RE, '')
      .replace(JS_URI_RE, '$1=""');
  } while (result !== prev);
  return result;
}

// ── Node.js exports for testing ─────────────────────────────────────────────

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { sanitizeHtml };
}

// ── Browser init ────────────────────────────────────────────────────────────

if (typeof window !== 'undefined') {
  (function () {
    var debounceTimer = null;
    var DEBOUNCE_MS = 300;

    document.addEventListener('DOMContentLoaded', function () {
      var textarea = document.getElementById('f-description');
      if (!textarea) return;

      // Find the preview container rendered by the build
      var preview = document.querySelector('.md-preview');
      if (!preview) return;

      var contentEl = preview.querySelector('.md-preview-content');
      if (!contentEl) return;

      function render() {
        var text = textarea.value.trim();
        if (!text) {
          preview.hidden = true;
          contentEl.innerHTML = '';
          return;
        }

        // marked is loaded via a separate <script> tag
        if (typeof marked === 'undefined' || !marked.parse) return;

        var html = marked.parse(text);
        contentEl.innerHTML = sanitizeHtml(html);
        preview.hidden = false;
      }

      textarea.addEventListener('input', function () {
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(render, DEBOUNCE_MS);
      });

      // Initial render (for edit form where textarea may have content)
      render();
    });
  })();
}
