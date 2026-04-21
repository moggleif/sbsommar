'use strict';

// Escape every RegExp metacharacter so `new RegExp(escapeRegExp(s))`
// matches only the literal string s. See 02-§95.3.
//
// The character class covers the full set defined by the JavaScript
// specification: `. * + ? ^ $ { } ( ) | [ ] \`.

function escapeRegExp(str) {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

module.exports = { escapeRegExp };
