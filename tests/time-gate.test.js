'use strict';

// Tests for form time-gating (02-§26.1–26.13).
//
// Testable requirements:
//   - 02-§26.13: build embeds data-opens and data-closes on the form element
//   - 02-§26.10/26.11: isOutsideEditingPeriod rejects outside the window
//   - 05-§1.6: opens_for_editing field documented and used
//
// Browser-only requirements (greyed-out form, disabled button, Swedish
// messages) must be verified manually:
//   1. Open lagg-till.html before opens_for_editing — confirm form is greyed
//      out, submit disabled, message shows opening date.
//   2. Open lagg-till.html after end_date + 1 — confirm form is greyed out,
//      submit disabled, message says "Lägret är avslutat."
//   3. Repeat for redigera.html.

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const { renderAddPage } = require('../source/build/render-add');
const { renderEditPage } = require('../source/build/render-edit');
const { isOutsideEditingPeriod } = require('../source/api/time-gate');

// ── Test data ────────────────────────────────────────────────────────────────

const CAMP = {
  name: 'SB Test 2026',
  start_date: '2026-06-21',
  end_date: '2026-06-27',
  opens_for_editing: '2026-06-14',
};
const LOCATIONS = ['Servicehus', 'Badet', 'Annat'];
const API_URL = 'https://api.example.com/add-event';

// ── renderAddPage – data attributes (02-§26.13) ─────────────────────────────

describe('renderAddPage – time-gating data attributes (02-§26.13)', () => {
  function render() {
    return renderAddPage(CAMP, LOCATIONS, API_URL);
  }

  it('GATE-01: form has data-opens attribute matching opens_for_editing', () => {
    const html = render();
    assert.ok(
      html.includes('data-opens="2026-06-14"'),
      'Form is missing data-opens="2026-06-14"',
    );
  });

  it('GATE-02: form has data-closes attribute set to end_date + 1 day', () => {
    const html = render();
    assert.ok(
      html.includes('data-closes="2026-06-28"'),
      'Form is missing data-closes="2026-06-28" (end_date + 1)',
    );
  });
});

// ── renderEditPage – data attributes (02-§26.13) ────────────────────────────

describe('renderEditPage – time-gating data attributes (02-§26.13)', () => {
  function render() {
    return renderEditPage(CAMP, LOCATIONS, API_URL);
  }

  it('GATE-03: form has data-opens attribute matching opens_for_editing', () => {
    const html = render();
    assert.ok(
      html.includes('data-opens="2026-06-14"'),
      'Form is missing data-opens="2026-06-14"',
    );
  });

  it('GATE-04: form has data-closes attribute set to end_date + 1 day', () => {
    const html = render();
    assert.ok(
      html.includes('data-closes="2026-06-28"'),
      'Form is missing data-closes="2026-06-28" (end_date + 1)',
    );
  });
});

// ── isOutsideEditingPeriod (02-§26.10, 02-§26.11) ──────────────────────────

describe('isOutsideEditingPeriod (02-§26.10, 02-§26.11)', () => {
  const opens = '2026-06-14';
  const endDate = '2026-06-27';

  it('GATE-05: returns true when today is before opens_for_editing', () => {
    assert.strictEqual(isOutsideEditingPeriod('2026-06-13', opens, endDate), true);
  });

  it('GATE-06: returns false on the opens_for_editing date itself', () => {
    assert.strictEqual(isOutsideEditingPeriod('2026-06-14', opens, endDate), false);
  });

  it('GATE-07: returns false during the camp (between opens and end_date)', () => {
    assert.strictEqual(isOutsideEditingPeriod('2026-06-21', opens, endDate), false);
  });

  it('GATE-08: returns false on end_date itself', () => {
    assert.strictEqual(isOutsideEditingPeriod('2026-06-27', opens, endDate), false);
  });

  it('GATE-09: returns false on end_date + 1 day (last allowed day)', () => {
    assert.strictEqual(isOutsideEditingPeriod('2026-06-28', opens, endDate), false);
  });

  it('GATE-10: returns true on end_date + 2 days (first disallowed day)', () => {
    assert.strictEqual(isOutsideEditingPeriod('2026-06-29', opens, endDate), true);
  });
});
