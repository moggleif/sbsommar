'use strict';

// Tests for the shared escapeRegExp() helper (02-§95.3).
//
// The helper must escape every RegExp metacharacter so that
// `new RegExp(escapeRegExp(s))` matches the literal string s — and
// nothing else — even when s contains `.`, `*`, `+`, `?`, `^`, `$`,
// `{`, `}`, `(`, `)`, `|`, `[`, `]`, or `\`.

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const { escapeRegExp } = require('./helpers/regex-escape.js');

describe('02-§95.3 — escapeRegExp covers all metacharacters (RE-01..15)', () => {
  const metachars = ['.', '*', '+', '?', '^', '$', '{', '}', '(', ')', '|', '[', ']', '\\'];

  metachars.forEach((ch, i) => {
    const id = `RE-${String(i + 1).padStart(2, '0')}`;
    it(`${id}: escaped '${ch}' matches the literal character`, () => {
      const re = new RegExp('^' + escapeRegExp(ch) + '$');
      assert.ok(re.test(ch), `${JSON.stringify(ch)} must match escaped pattern`);
    });
  });

  it('RE-15: composite selector is matched exactly and nothing else', () => {
    const selector = '.md-preview h1';
    const re = new RegExp(escapeRegExp(selector));
    assert.ok(re.test('.md-preview h1'));
    // Without escaping, `.` would match any char — verify it no longer does.
    assert.ok(!re.test('xmd-preview h1'));
  });
});

describe('02-§95.3 — escapeRegExp leaves normal strings unchanged (RE-16..18)', () => {
  it('RE-16: alphanumerics are not escaped', () => {
    assert.equal(escapeRegExp('abc123'), 'abc123');
  });

  it('RE-17: empty string is returned as empty', () => {
    assert.equal(escapeRegExp(''), '');
  });

  it('RE-18: non-string input is coerced via String()', () => {
    assert.equal(escapeRegExp(42), '42');
  });
});
