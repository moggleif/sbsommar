'use strict';

// Tests for client-side link field validation (02-§81.1–81.10).
//
// The link field is optional. When non-empty, blur validation checks:
//   1. Protocol: must start with http:// or https://
//   2. Domain: must contain at least one dot after the protocol
//
// These are source-code structural checks — the actual DOM behaviour
// requires browser testing.
//
// Manual checkpoints (must be verified in a browser):
//   LINK-M1 (02-§81.1): on /lagg-till.html, enter "example.com" in the link
//     field and tab away → error message appears below the field.
//   LINK-M2 (02-§81.4): leave the link field empty and tab away → no error.
//   LINK-M3 (02-§81.5): trigger an error, then start typing → error clears.
//   LINK-M4 (02-§81.8): trigger a link error, try to submit → submit blocked.

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const SRC = fs.readFileSync(
  path.join(__dirname, '..', 'source', 'assets', 'js', 'client', 'lagg-till.js'),
  'utf8',
);

const ADD_HTML = fs.readFileSync(
  path.join(__dirname, '..', 'source', 'build', 'render-add.js'),
  'utf8',
);

describe('02-§81 — Client-side link field validation', () => {
  // ── HTML structure ──────────────────────────────────────────────────────

  it('LINK-01: render-add.js includes an error span for the link field (02-§81.3)', () => {
    assert.ok(
      ADD_HTML.includes('err-link'),
      'render-add.js must contain an error span with id="err-link"',
    );
  });

  it('LINK-02: render-add.js links the link input to its error span via aria-describedby (02-§81.3)', () => {
    assert.ok(
      ADD_HTML.includes('aria-describedby="err-link"'),
      'link input must have aria-describedby="err-link"',
    );
  });

  // ── JS validation logic ─────────────────────────────────────────────────

  it('LINK-03: lagg-till.js registers a blur listener on the link field (02-§81.1)', () => {
    // The link field must have a blur handler for validation.
    assert.ok(
      SRC.includes('f-link') || SRC.includes("'link'"),
      'source must reference the link field',
    );
    assert.ok(
      SRC.includes("'blur'") || SRC.includes('"blur"'),
      'source must contain a blur event listener',
    );
  });

  it('LINK-04: lagg-till.js checks for http/https protocol (02-§81.1)', () => {
    assert.ok(
      SRC.includes('https://') || SRC.includes('http://'),
      'source must check for http/https protocol',
    );
    assert.ok(
      /https?:\/\//i.test(SRC),
      'source must contain protocol pattern check',
    );
  });

  it('LINK-05: lagg-till.js checks for a dot in the URL (02-§81.2)', () => {
    // The validation must ensure the URL contains at least one dot (domain check).
    assert.ok(
      SRC.includes("'.'") || SRC.includes('"."') || SRC.includes('\\.'),
      'source must check for a dot in the URL',
    );
  });

  it('LINK-06: lagg-till.js contains the missing-protocol error message in Swedish (02-§81.6)', () => {
    assert.ok(
      SRC.includes('Länken måste börja med https:// eller http://'),
      'source must contain the Swedish missing-protocol error message',
    );
  });

  it('LINK-07: lagg-till.js contains the invalid-URL error message in Swedish (02-§81.7)', () => {
    assert.ok(
      SRC.includes('Länken ser inte ut som en giltig webbadress'),
      'source must contain the Swedish invalid-URL error message',
    );
  });

  it('LINK-08: lagg-till.js clears link error on input event (02-§81.5)', () => {
    // There must be an input listener that clears the link field error.
    assert.ok(
      SRC.includes("'input'") || SRC.includes('"input"'),
      'source must contain an input event listener for clearing errors',
    );
  });

  it('LINK-09: lagg-till.js uses setFieldError for link validation (02-§81.10)', () => {
    assert.ok(
      SRC.includes('setFieldError'),
      'source must use setFieldError helper',
    );
  });

  it('LINK-10: lagg-till.js includes link in clearAllErrors (02-§81.10)', () => {
    // clearAllErrors must also clear the link field error.
    assert.ok(
      SRC.includes("'link'") && SRC.includes('clearAllErrors'),
      'clearAllErrors must include the link field',
    );
  });
});
