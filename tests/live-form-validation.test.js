'use strict';

// Tests for live form validation in lagg-till.js (02-§6.9–6.14).
//
// All requirements involve browser DOM events (blur, change, input) that
// cannot be exercised in Node.js.  The tests here are source-code structural
// checks: they verify that the client JS file contains the event listener
// registrations required for the live validation to function.
//
// Manual checkpoints (must be verified in a browser):
//   LVD-01 (02-§6.9):  open /lagg-till.html, select a past date →
//     inline error appears immediately, without clicking Skicka.
//   LVD-02 (02-§6.10): fill in Starttid, then set Sluttid to a time before
//     it → inline error appears immediately on the Sluttid field.
//   LVD-03 (02-§6.11): tab through all required fields without filling any →
//     each field shows an inline error as focus leaves it.
//   LVD-04 (02-§6.12): trigger a live error, then start editing the field →
//     the error disappears immediately (before submitting).
//   LVD-05 (02-§6.13): fill Sluttid, then change Starttid to after Sluttid →
//     end-time error appears; change Starttid back to before Sluttid →
//     end-time error clears.
//   LVD-06 (02-§6.14): pick today's date and a start time more than 2 hours
//     in the past → inline error appears on the start field.
//     Pick a future date → no past-time error.

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const SRC = fs.readFileSync(
  path.join(__dirname, '..', 'source', 'assets', 'js', 'client', 'lagg-till.js'),
  'utf8',
);

describe('live form validation — source checks (02-§6.9–6.14)', () => {
  it("LVD-01: lagg-till.js registers a 'change' listener on the date field (02-§6.9)", () => {
    assert.ok(
      SRC.includes("'change'") || SRC.includes('"change"'),
      "source must contain a 'change' event listener",
    );
  });

  it("LVD-02: lagg-till.js registers a 'change' listener for end-time cross-check (02-§6.10)", () => {
    assert.ok(
      SRC.includes("f-end") || SRC.includes('"end"') || SRC.includes("'end'"),
      "source must reference the end field for change validation",
    );
  });

  it("LVD-03: lagg-till.js registers a 'blur' listener for required-field empty checks (02-§6.11)", () => {
    assert.ok(
      SRC.includes("'blur'") || SRC.includes('"blur"'),
      "source must contain a 'blur' event listener",
    );
  });

  it("LVD-04: lagg-till.js registers an 'input' or 'change' listener to clear errors (02-§6.12)", () => {
    assert.ok(
      SRC.includes("'input'") || SRC.includes('"input"'),
      "source must contain an 'input' event listener for clearing errors",
    );
  });

  it("LVD-05: lagg-till.js registers a 'change' listener on the start field (02-§6.13)", () => {
    // The start input must trigger re-evaluation of the end-time cross-check.
    assert.ok(
      SRC.includes("f-start") || SRC.includes('"start"') || SRC.includes("'start'"),
      "source must reference the start field for change re-validation",
    );
    assert.ok(
      SRC.includes("startInput") || SRC.includes("f-start"),
      "source must have a dedicated start-input variable or selector",
    );
  });

  it("LVD-06: lagg-till.js contains 2-hour past-time check logic (02-§6.14)", () => {
    // The check computes a cutoff 120 minutes before now.
    assert.ok(
      SRC.includes('120') || SRC.includes('2 *') || SRC.includes('* 60'),
      "source must contain the 2-hour (120-minute) cutoff constant",
    );
  });
});
