'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const { renderEditPage } = require('../source/build/render-edit');

// ── Shared fixtures ─────────────────────────────────────────────────────────

const CAMP = {
  name: 'SB sommar 2099 juli',
  location: 'Sysslebäck',
  start_date: '2099-07-01',
  end_date: '2099-07-07',
  opens_for_editing: '2099-06-15',
};

const LOCATIONS = ['Servicehus', 'Strand', 'Annat'];
const API_URL = '/edit-event';

function render() {
  return renderEditPage(CAMP, LOCATIONS, API_URL);
}

// ── 02-§2.11 / 02-§18.20  Edit page exists ─────────────────────────────────

describe('02-§2.11 / 02-§18.20 — Edit page rendered', () => {
  it('REDT-01: produces a <!DOCTYPE html> page', () => {
    const html = render();
    assert.ok(html.includes('<!DOCTYPE html>'), 'has DOCTYPE');
  });

  it('REDT-02: title includes "Redigera aktivitet"', () => {
    const html = render();
    assert.ok(html.includes('<title>Redigera aktivitet'), 'Redigera title');
  });

  it('REDT-03: has navigation', () => {
    const html = render();
    assert.ok(html.includes('class="page-nav"'), 'has page-nav');
  });
});

// ── 02-§18.23  Edit form has same fields as add form ────────────────────────

describe('02-§18.23 — Edit form exposes same fields as add form', () => {
  it('REDT-04: has title field', () => {
    const html = render();
    assert.ok(html.includes('id="f-title"'), 'title field');
  });

  it('REDT-05: has date field with min/max', () => {
    const html = render();
    assert.ok(html.includes('id="f-date"'), 'date field');
    assert.ok(html.includes('min="2099-07-01"'), 'min date');
    assert.ok(html.includes('max="2099-07-07"'), 'max date');
  });

  it('REDT-06: has start and end time fields', () => {
    const html = render();
    assert.ok(html.includes('id="f-start"'), 'start field');
    assert.ok(html.includes('id="f-end"'), 'end field');
  });

  it('REDT-07: has location dropdown', () => {
    const html = render();
    assert.ok(html.includes('<select id="f-location"'), 'location select');
    assert.ok(html.includes('>Servicehus<'), 'location option');
  });

  it('REDT-08: has responsible field', () => {
    const html = render();
    assert.ok(html.includes('id="f-responsible"'), 'responsible field');
  });

  it('REDT-09: has description textarea', () => {
    const html = render();
    assert.ok(html.includes('id="f-description"'), 'description field');
    assert.ok(html.includes('<textarea'), 'textarea element');
  });

  it('REDT-10: has link field', () => {
    const html = render();
    assert.ok(html.includes('id="f-link"'), 'link field');
  });

  it('REDT-11: has hidden id field', () => {
    const html = render();
    assert.ok(html.includes('type="hidden" id="f-id"'), 'hidden id field');
  });
});

// ── 02-§18.27  Edit form in Swedish ─────────────────────────────────────────

describe('02-§18.27 — Edit form in Swedish', () => {
  it('REDT-12: heading is "Redigera aktivitet"', () => {
    const html = render();
    assert.ok(html.includes('<h1>Redigera aktivitet</h1>'), 'Swedish heading');
  });

  it('REDT-13: submit button says "Spara ändringar →"', () => {
    const html = render();
    assert.ok(html.includes('Spara ändringar →'), 'Swedish submit');
  });

  it('REDT-14: cancel link says "Avbryt"', () => {
    const html = render();
    assert.ok(html.includes('Avbryt'), 'Swedish cancel');
  });

  it('REDT-15: loading text is Swedish', () => {
    const html = render();
    assert.ok(html.includes('Laddar aktivitet'), 'Swedish loading');
  });

  it('REDT-16: error text is Swedish', () => {
    const html = render();
    assert.ok(html.includes('kunde inte laddas'), 'Swedish error');
  });
});

// ── Three-phase rendering ───────────────────────────────────────────────────

describe('Edit page — three-phase rendering', () => {
  it('REDT-17: has loading state', () => {
    const html = render();
    assert.ok(html.includes('id="edit-loading"'), 'loading div');
    assert.ok(html.includes('role="status"'), 'loading has role status');
  });

  it('REDT-18: has error state (initially hidden)', () => {
    const html = render();
    assert.ok(html.includes('id="edit-error" hidden'), 'error div hidden');
  });

  it('REDT-19: has form section (initially hidden)', () => {
    const html = render();
    assert.ok(html.includes('id="edit-section" hidden'), 'form section hidden');
  });

  it('REDT-20: error state has back link to schema', () => {
    const html = render();
    const errorSection = html.substring(
      html.indexOf('id="edit-error"'),
      html.indexOf('</div>', html.indexOf('id="edit-error"') + 50),
    );
    assert.ok(errorSection.includes('href="schema.html"'), 'back link');
  });
});

// ── 02-§18.36  Only recognised fields written ───────────────────────────────
// Structural test: the form only contains known fields.

describe('02-§18.36 — Edit form contains only recognised fields', () => {
  it('REDT-21: form has exactly the expected input names', () => {
    const html = render();
    // Extract only within <form…</form> to avoid matching meta viewport, etc.
    const formHtml = html.match(/<form[^]*?<\/form>/)[0];
    const nameMatches = formHtml.match(/name="([^"]+)"/g) || [];
    const names = nameMatches.map((m) => m.match(/name="([^"]+)"/)[1]);
    const expected = ['id', 'title', 'date', 'start', 'end', 'location', 'responsible', 'description', 'link'];
    for (const n of expected) {
      assert.ok(names.includes(n), `expected field ${n} present`);
    }
    // No unexpected fields
    for (const n of names) {
      assert.ok(expected.includes(n), `field ${n} is expected`);
    }
  });
});

// ── Time-gate data attributes ───────────────────────────────────────────────

describe('Edit page — time-gate data attributes', () => {
  it('REDT-22: form has data-opens attribute', () => {
    const html = render();
    assert.ok(html.includes('data-opens="2099-06-15"'), 'opens date');
  });

  it('REDT-23: form has data-closes attribute (end + 1 day)', () => {
    const html = render();
    assert.ok(html.includes('data-closes="2099-07-08"'), 'closes date');
  });

  it('REDT-24: form has data-camp-start and data-camp-end', () => {
    const html = render();
    assert.ok(html.includes('data-camp-start="2099-07-01"'), 'camp start');
    assert.ok(html.includes('data-camp-end="2099-07-07"'), 'camp end');
  });
});

// ── Script loading ──────────────────────────────────────────────────────────

describe('Edit page — client scripts', () => {
  it('REDT-25: loads redigera.js', () => {
    const html = render();
    assert.ok(html.includes('src="redigera.js"'), 'redigera.js loaded');
  });

  it('REDT-26: loads nav.js with defer', () => {
    const html = render();
    assert.ok(html.includes('src="nav.js" defer'), 'nav.js deferred');
  });

  it('REDT-27: does NOT load cookie-consent.js (no consent on edit)', () => {
    const html = render();
    assert.ok(!html.includes('cookie-consent.js'), 'no cookie consent on edit');
  });
});

// ── "Annat" last in location list ───────────────────────────────────────────

describe('Edit page — location deduplication', () => {
  it('REDT-28: "Annat" is last in location list', () => {
    const html = render();
    const lastAnnatPos = html.lastIndexOf('>Annat<');
    const servicehusPos = html.lastIndexOf('>Servicehus<');
    assert.ok(servicehusPos < lastAnnatPos, 'Servicehus before Annat');
  });
});
