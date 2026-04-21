'use strict';

// Sanitizing renderer overrides for the `marked` Markdown parser
// (02-§56.6, 02-§58.8). One source of truth shared by:
//   - source/build/markdown.js  (Node, build time)
//   - source/assets/js/client/markdown-preview.js  (browser, live preview)
//
// Drop strategy:
//   - The `html` renderer returns the empty string. Marked tokenises every
//     raw HTML block and inline tag (Tokens.HTML, Tokens.Tag) and routes
//     them through this renderer, so dropping its output removes all raw
//     HTML — script, iframe, object, embed, on* attributes, anything —
//     before it can reach the rendered output. There is nothing to
//     "incompletely sanitize" because the dangerous text never enters
//     the output stream in the first place.
//   - The `link` and `image` renderers re-emit safe HTML built from the
//     parsed token, after passing the URI through `isUnsafeUri()`. Any
//     URI that begins (after stripping whitespace and control characters
//     and lower-casing) with `javascript:`, `vbscript:`, `data:` or
//     `file:` becomes the empty string in href/src.

(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory();
  } else {
    root.MarkdownRenderers = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {

  function escapeAttr(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function isUnsafeUri(href) {
    if (typeof href !== 'string') return false;
    // Strip whitespace and C0 control characters before scheme matching so that
    // "  javascript:" and "java\tscript:" cannot evade detection.
    // eslint-disable-next-line no-control-regex
    var cleaned = href.replace(/[\s\u0000-\u001F]+/g, '').toLowerCase();
    return /^(javascript|vbscript|data|file):/.test(cleaned);
  }

  var renderers = {
    html: function () { return ''; },

    link: function (token) {
      var href = isUnsafeUri(token.href) ? '' : (token.href || '');
      var inner = this.parser.parseInline(token.tokens);
      var titleAttr = token.title ? ' title="' + escapeAttr(token.title) + '"' : '';
      return '<a href="' + escapeAttr(href) + '"' + titleAttr + '>' + inner + '</a>';
    },

    image: function (token) {
      var href = isUnsafeUri(token.href) ? '' : (token.href || '');
      var titleAttr = token.title ? ' title="' + escapeAttr(token.title) + '"' : '';
      return '<img src="' + escapeAttr(href) + '" alt="' + escapeAttr(token.text || '') + '"' + titleAttr + '>';
    },
  };

  return { renderers: renderers, isUnsafeUri: isUnsafeUri, escapeAttr: escapeAttr };
}));
