'use strict';

// Tests for 02-§18.47 and 02-§18.48 — cookie domain injection at build time.
//
// The build must inject a data-cookie-domain attribute on <body> for every page
// that loads session.js, so client-side cookie write-back uses the same Domain
// attribute as the server.
//
// 02-§18.47 (client-side write-back uses Domain) is browser-only:
//   1. Deploy to QA with COOKIE_DOMAIN set (e.g. sbsommar.se).
//   2. Create an event (accept cookie consent).
//   3. Visit schema.html — session.js runs expiry cleanup and writes back the cookie.
//   4. Open DevTools → Application → Cookies and verify the sb_session cookie
//      has Domain=.sbsommar.se (matching the server-set value).
//   5. Repeat on idag.html.

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const { renderSchedulePage } = require('../source/build/render');
const { renderIdagPage } = require('../source/build/render-idag');

const CAMP = {
  name: 'Test Camp',
  start_date: '2026-06-21',
  end_date: '2026-06-27',
};
const EVENTS = [];

// ── renderSchedulePage ──────────────────────────────────────────────────────

describe('02-§18.48 — cookie domain injection on schema.html (CDI-01..02)', () => {
  it('CDI-01: <body> includes data-cookie-domain when cookieDomain is provided', () => {
    const html = renderSchedulePage(CAMP, EVENTS, '', [], '', 'sbsommar.se');
    assert.match(html, /data-cookie-domain="sbsommar\.se"/,
      'Expected <body> to carry data-cookie-domain="sbsommar.se"');
  });

  it('CDI-02: <body> has no data-cookie-domain when cookieDomain is omitted', () => {
    const html = renderSchedulePage(CAMP, EVENTS);
    assert.doesNotMatch(html, /data-cookie-domain/,
      'Expected no data-cookie-domain attribute when cookieDomain is not provided');
  });
});

// ── renderIdagPage ──────────────────────────────────────────────────────────

describe('02-§18.48 — cookie domain injection on idag.html (CDI-03..04)', () => {
  it('CDI-03: <body> includes data-cookie-domain when cookieDomain is provided', () => {
    const html = renderIdagPage(CAMP, EVENTS, '', [], 'sbsommar.se');
    assert.match(html, /data-cookie-domain="sbsommar\.se"/,
      'Expected <body> to carry data-cookie-domain="sbsommar.se"');
  });

  it('CDI-04: <body> has no data-cookie-domain when cookieDomain is omitted', () => {
    const html = renderIdagPage(CAMP, EVENTS);
    assert.doesNotMatch(html, /data-cookie-domain/,
      'Expected no data-cookie-domain attribute when cookieDomain is not provided');
  });
});
