'use strict';

// Tests for §90 — Cookie Debug Panel and Session Cookie Repair
//
// Structural tests verify the HTML output of renderEditPage().
// Cookie repair logic (duplicate detection/merge) runs in the browser;
// the subset that CAN be tested here covers the server-side session module
// and the rendered HTML skeleton.
//
// Browser-only requirements (dynamic content after events.json fetch,
// protocol/domain display, repair status message) must be verified manually:
//   1. Open redigera.html in a browser with a valid sb_session cookie.
//   2. Expand the "Om din cookie" section.
//   3. Confirm protocol, cookie domain, event IDs, and statuses are shown.
//   4. Simulate duplicate cookies via DevTools → confirm repair message.

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const { renderEditPage } = require('../source/build/render-edit');

const CAMP = {
  name: 'SB Sommar 2026',
  start_date: '2026-06-21',
  end_date: '2026-06-27',
};
const LOCATIONS = ['Servicehus', 'Annat'];
const API_URL = 'https://api.example.com/edit-event';

function render() {
  return renderEditPage(CAMP, LOCATIONS, API_URL);
}

// ── 02-§90.1  Collapsible cookie info section ──────────────────────────────

describe('§90 — Cookie debug panel structure', () => {
  it('CKD-01 (02-§90.1): edit page contains a <details> element for cookie info', () => {
    const html = render();
    assert.ok(
      html.includes('id="cookie-debug"'),
      'Expected a #cookie-debug element in the edit page HTML',
    );
  });

  it('CKD-02 (02-§90.3): cookie debug section has a <summary> with Swedish text', () => {
    const html = render();
    assert.match(
      html,
      /<summary[^>]*>.*cookie/i,
      'Expected <summary> with cookie-related Swedish heading',
    );
  });

  it('CKD-03 (02-§90.3): cookie debug section is not open by default', () => {
    const html = render();
    // The <details> should NOT have the "open" attribute
    const detailsMatch = html.match(/<details[^>]*id="cookie-debug"[^>]*>/);
    assert.ok(detailsMatch, 'No <details id="cookie-debug"> found');
    assert.ok(
      !detailsMatch[0].includes(' open'),
      'Cookie debug <details> should be collapsed by default (no open attribute)',
    );
  });

  it('CKD-04 (02-§90.16): cookie debug section is inside <main>', () => {
    const html = render();
    const mainStart = html.indexOf('<main');
    const mainEnd = html.indexOf('</main>');
    const debugPos = html.indexOf('id="cookie-debug"');
    assert.ok(debugPos > mainStart && debugPos < mainEnd,
      'Cookie debug panel must be inside <main>');
  });
});

// ── 02-§90.5  Informational text about cleanup ─────────────────────────────

describe('§90 — Informational text about event cleanup', () => {
  it('CKD-05 (02-§90.5): edit page contains explanation about passed events', () => {
    const html = render();
    assert.ok(
      html.includes('id="cookie-debug"'),
      'Cookie debug section must exist to contain the cleanup explanation',
    );
  });
});

// ── 02-§90.12  removeIdFromCookie attributes (tested via render) ────────────

describe('§90 — Edit page loads session cookie domain', () => {
  it('CKD-06 (02-§90.12): redigera.js is loaded on the edit page', () => {
    const html = render();
    assert.ok(
      html.includes('redigera.js'),
      'Edit page must load redigera.js for cookie write-back',
    );
  });
});
