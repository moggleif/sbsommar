'use strict';

// Tests for admin token infrastructure — 02-§91.1–91.28.
//
// Testable in Node.js:
//   - verify-admin module: token validation, constant-time comparison,
//     disabled when ADMIN_TOKENS is unset (ADM-01..07)
//   - render-admin.js: page structure, layout, form elements (ADM-08..12)
//   - layout.js: footer includes admin-icon container (ADM-13..14)
//   - token-embedded expiry: extractTokenExpiry, isTokenExpired (ADM-25..35)
//
// Browser-only (manual checkpoints documented in traceability):
//   - 02-§91.11: Calls POST /verify-admin on submit
//   - 02-§91.12: Valid → store token in localStorage, show success
//   - 02-§91.13: Invalid → show error, store nothing
//   - 02-§91.19: Footer shows admin icon when token in localStorage
//   - 02-§91.20: No token → nothing displayed
//   - 02-§91.21: Valid token → filled/locked icon
//   - 02-§91.22: Expired token → open/unlocked icon, links to /admin.html

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

// ── verify-admin module ─────────────────────────────────────────────────────

const { verifyAdminToken, parseAdminTokens } = require('../source/api/admin');

describe('parseAdminTokens (02-§91.1, §91.2)', () => {
  it('ADM-01: parses comma-separated tokens', () => {
    const tokens = parseAdminTokens('aaa,bbb,ccc');
    assert.deepStrictEqual(tokens, ['aaa', 'bbb', 'ccc']);
  });

  it('ADM-02: returns empty array when input is empty string', () => {
    assert.deepStrictEqual(parseAdminTokens(''), []);
  });

  it('ADM-03: returns empty array when input is undefined', () => {
    assert.deepStrictEqual(parseAdminTokens(undefined), []);
  });

  it('ADM-04: trims whitespace around tokens', () => {
    const tokens = parseAdminTokens(' aaa , bbb ');
    assert.deepStrictEqual(tokens, ['aaa', 'bbb']);
  });

  it('ADM-05: filters out empty entries from trailing commas', () => {
    const tokens = parseAdminTokens('aaa,,bbb,');
    assert.deepStrictEqual(tokens, ['aaa', 'bbb']);
  });
});

describe('verifyAdminToken (02-§91.3, §91.6, §91.7, §91.8)', () => {
  // Use future epoch so tokens are not rejected by expiry check
  const futureEpoch = Math.floor(Date.now() / 1000) + 86400;

  it('ADM-06: returns true when token matches one in the list', () => {
    const tok = `my_token_${futureEpoch}`;
    assert.strictEqual(verifyAdminToken(tok, ['other', tok]), true);
  });

  it('ADM-07: returns false when token does not match', () => {
    const tok = `wrong_${futureEpoch}`;
    assert.strictEqual(verifyAdminToken(tok, ['aaa', 'bbb']), false);
  });

  it('ADM-08: returns false when token list is empty (§91.3)', () => {
    const tok = `anything_${futureEpoch}`;
    assert.strictEqual(verifyAdminToken(tok, []), false);
  });

  it('ADM-09: returns false when token is empty string', () => {
    assert.strictEqual(verifyAdminToken('', ['aaa']), false);
  });

  it('ADM-10: returns false when token is undefined', () => {
    assert.strictEqual(verifyAdminToken(undefined, ['aaa']), false);
  });
});

// ── render-admin page ───────────────────────────────────────────────────────

const { renderAdminPage } = require('../source/build/render-admin');

const CAMP = {
  name: 'SB Sommar 2026',
  start_date: '2026-06-28',
  end_date: '2026-07-05',
};
const FOOTER_HTML = '<p>Test footer</p>';

describe('renderAdminPage (02-§91.9, §91.10, §91.14, §91.15)', () => {
  it('ADM-11: renders a valid HTML document', () => {
    const html = renderAdminPage(CAMP, FOOTER_HTML);
    assert.ok(html.includes('<!DOCTYPE html>'), 'Expected doctype');
    assert.ok(html.includes('</html>'), 'Expected closing html tag');
  });

  it('ADM-12: contains a text input for the token', () => {
    const html = renderAdminPage(CAMP, FOOTER_HTML);
    assert.ok(html.includes('type="text"') || html.includes("type='text'"),
      'Expected text input');
  });

  it('ADM-13: contains a submit button', () => {
    const html = renderAdminPage(CAMP, FOOTER_HTML);
    assert.ok(html.includes('type="submit"') || html.includes("type='submit'"),
      'Expected submit button');
  });

  it('ADM-14: includes shared layout (nav and footer)', () => {
    const html = renderAdminPage(CAMP, FOOTER_HTML);
    assert.ok(html.includes('class="page-nav"'), 'Expected page-nav');
    assert.ok(html.includes('class="site-footer"'), 'Expected site-footer');
    assert.ok(html.includes('Test footer'), 'Expected footer content');
  });

  it('ADM-15: page is not listed in navigation links', () => {
    const html = renderAdminPage(CAMP, FOOTER_HTML);
    // The nav links should not contain admin.html
    const navMatch = html.match(/<nav[^>]*>[\s\S]*?<\/nav>/);
    assert.ok(navMatch, 'Expected nav element');
    assert.ok(!navMatch[0].includes('admin.html'), 'admin.html must not be in nav');
  });

  it('ADM-16: user-facing text is in Swedish (§91.25)', () => {
    const html = renderAdminPage(CAMP, FOOTER_HTML);
    assert.ok(html.includes('lang="sv"'), 'Expected lang="sv"');
  });

  it('ADM-17: includes admin.js script', () => {
    const html = renderAdminPage(CAMP, FOOTER_HTML);
    assert.ok(html.includes('admin'), 'Expected reference to admin script');
  });
});

// ── Footer admin-icon container ─────────────────────────────────────────────
// ADM-18: admin-status is now injected by build.js inside the version
// paragraph, not by pageFooter. Verified by snapshot tests.

// ── Token-embedded expiry ───────────────────────────────────────────────────

const { isTokenExpired, extractTokenExpiry } = require('../source/api/admin');

describe('extractTokenExpiry', () => {
  it('ADM-25: extracts epoch from valid token format', () => {
    assert.strictEqual(extractTokenExpiry('erik_abc123_1752710400'), 1752710400);
  });

  it('ADM-26: returns 0 for token without epoch suffix', () => {
    assert.strictEqual(extractTokenExpiry('erik_abc123'), 0);
  });

  it('ADM-27: returns 0 for empty string', () => {
    assert.strictEqual(extractTokenExpiry(''), 0);
  });

  it('ADM-28: returns 0 for undefined', () => {
    assert.strictEqual(extractTokenExpiry(undefined), 0);
  });

  it('ADM-29: returns 0 when last segment is not a number', () => {
    assert.strictEqual(extractTokenExpiry('erik_abc123_notanumber'), 0);
  });
});

describe('isTokenExpired', () => {
  it('ADM-30: returns false for token with future epoch', () => {
    const future = Math.floor(Date.now() / 1000) + 86400;
    assert.strictEqual(isTokenExpired(`test_uuid_${future}`), false);
  });

  it('ADM-31: returns true for token with past epoch', () => {
    const past = Math.floor(Date.now() / 1000) - 86400;
    assert.strictEqual(isTokenExpired(`test_uuid_${past}`), true);
  });

  it('ADM-32: returns true for token without epoch', () => {
    assert.strictEqual(isTokenExpired('test_uuid'), true);
  });

  it('ADM-33: returns true for undefined', () => {
    assert.strictEqual(isTokenExpired(undefined), true);
  });
});

describe('verifyAdminToken with embedded expiry', () => {
  it('ADM-34: rejects expired token even if it matches list', () => {
    const past = Math.floor(Date.now() / 1000) - 86400;
    const token = `test_uuid_${past}`;
    assert.strictEqual(verifyAdminToken(token, [token]), false);
  });

  it('ADM-35: accepts valid non-expired token', () => {
    const future = Math.floor(Date.now() / 1000) + 86400;
    const token = `test_uuid_${future}`;
    assert.strictEqual(verifyAdminToken(token, [token]), true);
  });
});

