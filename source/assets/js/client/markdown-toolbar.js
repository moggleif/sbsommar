/* Markdown toolbar for description textareas (02-§57.1–57.13).
 *
 * Initialises automatically on DOMContentLoaded: finds #f-description and
 * injects a toolbar row of formatting buttons above it.
 *
 * Core functions are exported for unit testing when loaded in Node.js.
 */
(function () {
  'use strict';

  // ── Button definitions ──────────────────────────────────────────────────

  var BUTTONS = [
    {
      id: 'bold',
      label: 'Fet',
      type: 'wrap',
      before: '**',
      after: '**',
      placeholder: 'fet text',
      svg: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 2.5h5a3.25 3.25 0 0 1 0 6.5H4z"/><path d="M4 9h5.5a3.25 3.25 0 0 1 0 6.5H4z"/></svg>',
    },
    {
      id: 'italic',
      label: 'Kursiv',
      type: 'wrap',
      before: '*',
      after: '*',
      placeholder: 'kursiv text',
      svg: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="10" y1="2" x2="6" y2="14"/><line x1="5" y1="2" x2="12" y2="2"/><line x1="4" y1="14" x2="11" y2="14"/></svg>',
    },
    {
      id: 'heading',
      label: 'Rubrik',
      type: 'prefix',
      prefix: '## ',
      placeholder: 'rubrik',
      svg: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2v12"/><path d="M13 2v12"/><path d="M3 8h10"/></svg>',
    },
    {
      id: 'bullet-list',
      label: 'Punktlista',
      type: 'prefix',
      prefix: '- ',
      placeholder: 'listelement',
      svg: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="6" y1="4" x2="14" y2="4"/><line x1="6" y1="8" x2="14" y2="8"/><line x1="6" y1="12" x2="14" y2="12"/><circle cx="2.5" cy="4" r="1" fill="currentColor" stroke="none"/><circle cx="2.5" cy="8" r="1" fill="currentColor" stroke="none"/><circle cx="2.5" cy="12" r="1" fill="currentColor" stroke="none"/></svg>',
    },
    {
      id: 'numbered-list',
      label: 'Numrerad lista',
      type: 'prefix',
      prefix: '1. ',
      numbered: true,
      placeholder: 'listelement',
      svg: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="6" y1="4" x2="14" y2="4"/><line x1="6" y1="8" x2="14" y2="8"/><line x1="6" y1="12" x2="14" y2="12"/><text x="1" y="6" font-size="6" fill="currentColor" stroke="none" font-family="sans-serif">1</text><text x="1" y="10" font-size="6" fill="currentColor" stroke="none" font-family="sans-serif">2</text><text x="1" y="14" font-size="6" fill="currentColor" stroke="none" font-family="sans-serif">3</text></svg>',
    },
    {
      id: 'blockquote',
      label: 'Citat',
      type: 'prefix',
      prefix: '> ',
      placeholder: 'citat',
      svg: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="2" x2="3" y2="14"/><line x1="7" y1="5" x2="14" y2="5"/><line x1="7" y1="8" x2="14" y2="8"/><line x1="7" y1="11" x2="11" y2="11"/></svg>',
    },
  ];

  // ── Core text-manipulation functions ─────────────────────────────────────

  /** Wrap selected text (or insert placeholder) with before/after markers. */
  function applyWrap(text, selStart, selEnd, before, after, placeholder) {
    var selected = text.slice(selStart, selEnd);
    var hasSelection = selected.length > 0;
    var inner = hasSelection ? selected : placeholder;
    var newText =
      text.slice(0, selStart) + before + inner + after + text.slice(selEnd);
    return {
      text: newText,
      selStart: selStart + before.length,
      selEnd: selStart + before.length + inner.length,
    };
  }

  /** Prefix each line in the selection (or insert placeholder with prefix). */
  function applyPrefix(text, selStart, selEnd, prefix, placeholder) {
    var selected = text.slice(selStart, selEnd);
    var hasSelection = selected.length > 0;

    if (!hasSelection) {
      var inner = prefix + placeholder;
      var newText = text.slice(0, selStart) + inner + text.slice(selEnd);
      return {
        text: newText,
        selStart: selStart + prefix.length,
        selEnd: selStart + inner.length,
      };
    }

    var lines = selected.split('\n');
    var prefixed = lines.map(function (line, i) {
      var p = prefix;
      // For numbered lists, replace "1. " with the correct number.
      if (p === '1. ') {
        p = (i + 1) + '. ';
      }
      return p + line;
    });
    var joined = prefixed.join('\n');
    var result = text.slice(0, selStart) + joined + text.slice(selEnd);
    return {
      text: result,
      selStart: selStart,
      selEnd: selStart + joined.length,
    };
  }

  // ── Browser initialisation ──────────────────────────────────────────────

  if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function () {
      var textarea = document.getElementById('f-description');
      if (!textarea) return;

      // The .md-toolbar container is rendered in the HTML by the build step.
      // We populate it with buttons here.
      var toolbar = textarea.parentNode.querySelector('.md-toolbar');
      if (!toolbar) return;

      BUTTONS.forEach(function (btn) {
        var button = document.createElement('button');
        button.type = 'button';
        button.className = 'md-toolbar-btn';
        button.setAttribute('aria-label', btn.label);
        button.setAttribute('title', btn.label);
        button.innerHTML = btn.svg;

        button.addEventListener('click', function () {
          var start = textarea.selectionStart;
          var end = textarea.selectionEnd;
          var result;

          if (btn.type === 'wrap') {
            result = applyWrap(
              textarea.value, start, end,
              btn.before, btn.after, btn.placeholder,
            );
          } else {
            result = applyPrefix(
              textarea.value, start, end,
              btn.prefix, btn.placeholder,
            );
          }

          textarea.value = result.text;
          textarea.setSelectionRange(result.selStart, result.selEnd);
          textarea.focus();
        });

        toolbar.appendChild(button);
      });
    });
  }

  // ── Node.js exports for testing ─────────────────────────────────────────

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { applyWrap: applyWrap, applyPrefix: applyPrefix, BUTTONS: BUTTONS };
  }
})();
