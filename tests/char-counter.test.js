'use strict';

// Tests for §82 — Character counter on text input fields.
//
// Structural tests verify that renderAddPage() and renderEditPage() emit the
// correct maxlength attributes on text input fields. API validation tests
// verify that validate.js enforces the responsible limit of 60 characters.
//
// Browser-only requirements (counter visibility thresholds, color changes,
// input-event updates, form-reset hiding) must be verified manually:
//   1. Open lagg-till.html, type in the title field until >56 chars (70% of 80).
//      Confirm the counter "N / 80" appears right-aligned below the field.
//   2. Continue typing until >72 chars (90% of 80). Confirm the counter turns
//      terracotta.
//   3. Submit a valid activity. Confirm counters disappear after form reset.
//   4. Open redigera.html?id=<valid-id>. Confirm the same counter behaviour.

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const { renderAddPage } = require('../source/build/render-add');
const { renderEditPage } = require('../source/build/render-edit');
const { validateEventRequest } = require('../source/api/validate');

const CAMP = {
  name: 'Testläger',
  start_date: new Date('2099-07-01'),
  end_date: new Date('2099-07-07'),
};

const addHtml = renderAddPage(CAMP, ['Servicehus'], '/add-event');
const editHtml = renderEditPage(CAMP, ['Servicehus'], '/edit-event');

describe('§82 — Character counter: add-form maxlength attributes', function () {
  it('CC-01: title input has maxlength="80" (02-§82.1, 02-§82.2)', function () {
    assert.match(addHtml, /id="f-title"[^>]*maxlength="80"/);
  });

  it('CC-02: responsible input has maxlength="60" (02-§82.1, 02-§82.2)', function () {
    assert.match(addHtml, /id="f-responsible"[^>]*maxlength="60"/);
  });

  it('CC-03: description textarea has maxlength="2000" (02-§82.1, 02-§82.2)', function () {
    assert.match(addHtml, /id="f-description"[^>]*maxlength="2000"/);
  });

  it('CC-04: link input has maxlength="500" (02-§82.1, 02-§82.2)', function () {
    assert.match(addHtml, /id="f-link"[^>]*maxlength="500"/);
  });
});

describe('§82 — Character counter: edit-form maxlength attributes', function () {
  it('CC-05: title input has maxlength="80" (02-§82.2, 02-§82.12)', function () {
    assert.match(editHtml, /id="f-title"[^>]*maxlength="80"/);
  });

  it('CC-06: responsible input has maxlength="60" (02-§82.2, 02-§82.12)', function () {
    assert.match(editHtml, /id="f-responsible"[^>]*maxlength="60"/);
  });

  it('CC-07: description textarea has maxlength="2000" (02-§82.2, 02-§82.12)', function () {
    assert.match(editHtml, /id="f-description"[^>]*maxlength="2000"/);
  });

  it('CC-08: link input has maxlength="500" (02-§82.2, 02-§82.12)', function () {
    assert.match(editHtml, /id="f-link"[^>]*maxlength="500"/);
  });
});

describe('§82 — Character counter: API responsible limit', function () {
  it('CC-09: responsible over 60 chars is rejected (02-§82.3)', function () {
    const result = validateEventRequest({
      title: 'Test',
      date: '2099-07-02',
      start: '10:00',
      end: '11:00',
      location: 'Servicehus',
      responsible: 'A'.repeat(61),
    });
    assert.equal(result.ok, false);
    assert.match(result.error, /responsible/i);
  });

  it('CC-10: responsible at exactly 60 chars is accepted (02-§82.3)', function () {
    const result = validateEventRequest({
      title: 'Test',
      date: '2099-07-02',
      start: '10:00',
      end: '11:00',
      location: 'Servicehus',
      responsible: 'A'.repeat(60),
    });
    assert.equal(result.ok, true);
  });
});

describe('§82 — Character counter: CSS rules', function () {
  const fs = require('node:fs');
  const css = fs.readFileSync('source/assets/cs/style.css', 'utf8');

  it('CC-11: .char-counter rule exists in style.css (02-§82.9)', function () {
    assert.match(css, /\.char-counter\b/);
  });

  it('CC-12: .char-counter.warn rule exists in style.css (02-§82.6)', function () {
    assert.match(css, /\.char-counter\.warn\b/);
  });
});
