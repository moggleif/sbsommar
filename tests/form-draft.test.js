'use strict';

// Tests for form draft cache (02-§85.1–85.12).
//
// All requirements involve browser sessionStorage / DOM manipulation that
// cannot be exercised in Node.js. These are source-code structural checks
// verifying that the draft cache logic is present in lagg-till.js.
//
// Manual checkpoints:
//   DRAFT-M01 (02-§85.1): Fill in form, reload page → fields restored.
//   DRAFT-M02 (02-§85.2): Submit successfully → reload → form is empty.
//   DRAFT-M03 (02-§85.3): Fill in form, close tab, reopen → form is empty.
//   DRAFT-M04 (02-§85.9): Select days, reload → day buttons re-selected.

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const SRC = fs.readFileSync(
  path.join(__dirname, '..', 'source', 'assets', 'js', 'client', 'lagg-till.js'),
  'utf8',
);

describe('02-§85.4 — Draft stored under sb_form_draft key (DRAFT-01)', () => {
  it('DRAFT-01: source references sb_form_draft sessionStorage key', () => {
    assert.ok(
      SRC.includes('sb_form_draft'),
      'lagg-till.js must reference the sb_form_draft key',
    );
  });
});

describe('02-§85.5 — Text inputs saved on input event (DRAFT-02)', () => {
  it('DRAFT-02: source adds input event listener for draft saving', () => {
    assert.ok(
      /addEventListener\(\s*['"]input['"]/s.test(SRC),
      'lagg-till.js must listen for input events to save draft',
    );
  });
});

describe('02-§85.8 — Fields restored on page load (DRAFT-03)', () => {
  it('DRAFT-03: source reads from sessionStorage on load', () => {
    assert.ok(
      SRC.includes('sessionStorage.getItem') && SRC.includes('restoreDraft'),
      'lagg-till.js must read draft from sessionStorage via restoreDraft()',
    );
  });
});

describe('02-§85.10 — Draft removed after successful submission (DRAFT-04)', () => {
  it('DRAFT-04: source removes draft after success', () => {
    assert.ok(
      SRC.includes('sessionStorage.removeItem') && SRC.includes('clearDraft'),
      'lagg-till.js must remove draft after successful submit via clearDraft()',
    );
  });
});

describe('02-§85.12 — No new dependencies (DRAFT-05)', () => {
  it('DRAFT-05: source does not import or require external modules', () => {
    assert.ok(
      !SRC.includes('require(') && !SRC.includes('import '),
      'lagg-till.js must not use require() or import statements',
    );
  });
});
