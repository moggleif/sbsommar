'use strict';

// Tests for submission progress feedback (02-§53.6–53.11).
//
// All requirements involve browser DOM manipulation that cannot be exercised
// in Node.js. These are source-code structural checks.
//
// Manual checkpoints:
//   PROG-M01 (02-§53.7): Submit a valid event → modal shows stages with
//     green check marks appearing progressively.
//   PROG-M02 (02-§53.8): Timing feels natural (~0s, ~0.5s, ~2s).
//   PROG-M03 (02-§53.9): On success, all stages show green checks and
//     success message appears.
//   PROG-M04 (02-§53.10): Disconnect API → submit → progress stops at
//     current stage and error message appears.
//   PROG-M05 (02-§53.11): Edit an event → same progress list appears.

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ADD_SRC = fs.readFileSync(
  path.join(__dirname, '..', 'source', 'assets', 'js', 'client', 'lagg-till.js'),
  'utf8',
);

const EDIT_SRC = fs.readFileSync(
  path.join(__dirname, '..', 'source', 'assets', 'js', 'client', 'redigera.js'),
  'utf8',
);

describe('02-§53.6 — Progress list with submission stages (PROG-01..02)', () => {
  it('PROG-01: lagg-till.js references progress stage messages', () => {
    assert.ok(
      ADD_SRC.includes('Skickar till servern'),
      'add form must show "Skickar till servern" progress message',
    );
    assert.ok(
      ADD_SRC.includes('Kontrollerar aktiviteten'),
      'add form must show "Kontrollerar aktiviteten" progress message',
    );
    assert.ok(
      ADD_SRC.includes('Sparar aktiviteten'),
      'add form must show "Sparar aktiviteten" progress message',
    );
  });

  it('PROG-02: redigera.js references progress stage messages', () => {
    assert.ok(
      EDIT_SRC.includes('Skickar till servern'),
      'edit form must show "Skickar till servern" progress message',
    );
  });
});

describe('02-§53.11 — Progress list used in both add and edit forms (PROG-03..04)', () => {
  it('PROG-03: lagg-till.js has progress step rendering logic', () => {
    // The progress steps should be defined as an array or appear in sequence
    assert.ok(
      ADD_SRC.includes('progress') || ADD_SRC.includes('step'),
      'add form must have progress/step logic',
    );
  });

  it('PROG-04: redigera.js has progress step rendering logic', () => {
    assert.ok(
      EDIT_SRC.includes('progress') || EDIT_SRC.includes('step'),
      'edit form must have progress/step logic',
    );
  });
});
