'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const { renderAddPage } = require('../source/build/render-add');
const { validateBatchEventRequest } = require('../source/api/validate');

// ── Shared fixtures ─────────────────────────────────────────────────────────

const CAMP = {
  name: 'SB sommar 2099 juli',
  location: 'Sysslebäck',
  start_date: '2099-07-01',
  end_date: '2099-07-07',
  opens_for_editing: '2099-06-15',
};

const LOCATIONS = ['Servicehus', 'Strand', 'Skog', 'Annat'];
const API_URL = '/add-event';

function render(camp) {
  return renderAddPage(camp || CAMP, LOCATIONS, API_URL);
}

// ── 02-§80.1  Day grid replaces native date picker ─────────────────────────

describe('02-§80.1 — Day grid replaces native date picker', () => {
  it('DG-01: page contains a .day-grid container', () => {
    const html = render();
    assert.ok(html.includes('class="day-grid"'), 'day-grid container present');
  });

  it('DG-02: no native date input on add form', () => {
    const html = render();
    assert.ok(!html.includes('type="date"'), 'no type="date" input');
  });

  it('DG-03: hidden input for date value exists', () => {
    const html = render();
    assert.ok(html.includes('type="hidden"'), 'hidden date input exists');
    assert.ok(html.includes('id="f-date"'), 'has f-date id');
  });
});

// ── 02-§80.2  Day buttons show Swedish weekday and date ─────────────────────

describe('02-§80.2 — Day buttons show weekday abbreviation and date', () => {
  it('DG-04: day grid contains buttons with class day-btn', () => {
    const html = render();
    assert.ok(html.includes('class="day-btn"'), 'day-btn class present');
  });

  it('DG-05: day buttons show Swedish weekday and day/month', () => {
    const html = render();
    // 2099-07-01 is a Wednesday (Ons)
    assert.ok(html.includes('Ons'), 'Swedish weekday abbreviation present');
    assert.ok(html.includes('1/7'), 'day/month format present');
  });
});

// ── 02-§80.3  Grid contains exactly the days in camp range ──────────────────

describe('02-§80.3 — Day grid contains camp days', () => {
  it('DG-06: grid has correct number of day buttons (7 days)', () => {
    const html = render();
    const count = (html.match(/class="day-btn"/g) || []).length;
    assert.strictEqual(count, 7, 'seven day buttons for 7-day camp');
  });

  it('DG-07: each button has a data-date attribute', () => {
    const html = render();
    assert.ok(html.includes('data-date="2099-07-01"'), 'first day');
    assert.ok(html.includes('data-date="2099-07-07"'), 'last day');
  });
});

// ── 02-§80.5  Multi-select day grid (always) ─────────────────────────────────

describe('02-§80.5 — Day grid is always multi-select', () => {
  it('DG-08: day grid does not have data-mode attribute (always multi)', () => {
    const html = render();
    assert.ok(!html.includes('data-mode="single"'), 'no single mode attr');
  });

  it('DG-09: no recurring toggle in HTML', () => {
    const html = render();
    assert.ok(!html.includes('id="recurring-toggle"'), 'toggle removed');
  });
});

// ── 02-§80.10  At least one day required ────────────────────────────────────

describe('02-§80.10 — Date error span exists', () => {
  it('DG-11: error span for date field exists', () => {
    const html = render();
    assert.ok(html.includes('id="err-date"'), 'error span present');
  });
});

// ── 02-§80.12–80.18  Batch API validation ───────────────────────────────────

describe('02-§80.12 — Batch endpoint accepts dates array', () => {
  it('BATCH-01: accepts valid batch with dates array', () => {
    const r = validateBatchEventRequest({
      title: 'Frukost',
      dates: ['2099-07-02', '2099-07-03'],
      start: '08:00',
      end: '09:00',
      location: 'Matsalen',
      responsible: 'Alla',
    }, { start_date: '2099-07-01', end_date: '2099-07-07' });
    assert.strictEqual(r.ok, true);
  });

  it('BATCH-02: rejects when dates is not an array', () => {
    const r = validateBatchEventRequest({
      title: 'Frukost',
      dates: '2099-07-02',
      start: '08:00',
      end: '09:00',
      location: 'Matsalen',
      responsible: 'Alla',
    });
    assert.strictEqual(r.ok, false);
  });

  it('BATCH-03: rejects empty dates array', () => {
    const r = validateBatchEventRequest({
      title: 'Frukost',
      dates: [],
      start: '08:00',
      end: '09:00',
      location: 'Matsalen',
      responsible: 'Alla',
    });
    assert.strictEqual(r.ok, false);
  });
});

describe('02-§80.13 — Batch validates every date', () => {
  it('BATCH-04: rejects if any date is outside camp range', () => {
    const r = validateBatchEventRequest({
      title: 'Frukost',
      dates: ['2099-07-02', '2099-07-15'],
      start: '08:00',
      end: '09:00',
      location: 'Matsalen',
      responsible: 'Alla',
    }, { start_date: '2099-07-01', end_date: '2099-07-07' });
    assert.strictEqual(r.ok, false);
    assert.ok(r.error.includes('2099-07-15'));
  });

  it('BATCH-05: rejects if any date has invalid format', () => {
    const r = validateBatchEventRequest({
      title: 'Frukost',
      dates: ['2099-07-02', 'not-a-date'],
      start: '08:00',
      end: '09:00',
      location: 'Matsalen',
      responsible: 'Alla',
    });
    assert.strictEqual(r.ok, false);
  });
});

describe('02-§80.15 — All-or-nothing batch validation', () => {
  it('BATCH-06: validates all non-date fields with same rules as single', () => {
    const r = validateBatchEventRequest({
      title: '',
      dates: ['2099-07-02'],
      start: '08:00',
      end: '09:00',
      location: 'Matsalen',
      responsible: 'Alla',
    });
    assert.strictEqual(r.ok, false);
    assert.ok(r.error.includes('title'));
  });

  it('BATCH-07: validates time rules (end after start)', () => {
    const r = validateBatchEventRequest({
      title: 'Frukost',
      dates: ['2099-07-02'],
      start: '09:00',
      end: '08:00',
      location: 'Matsalen',
      responsible: 'Alla',
    });
    assert.strictEqual(r.ok, false);
    assert.ok(r.error.includes('end'));
  });
});

describe('02-§80.17 — Batch response includes eventIds', () => {
  it('BATCH-08: successful validation returns eventIds array', () => {
    const r = validateBatchEventRequest({
      title: 'Frukost',
      dates: ['2099-07-02', '2099-07-03', '2099-07-04'],
      start: '08:00',
      end: '09:00',
      location: 'Matsalen',
      responsible: 'Alla',
    }, { start_date: '2099-07-01', end_date: '2099-07-07' });
    assert.strictEqual(r.ok, true);
    assert.ok(Array.isArray(r.eventIds), 'eventIds is an array');
    assert.strictEqual(r.eventIds.length, 3, 'three event IDs');
  });
});

describe('02-§80.18 — Batch validates injection patterns', () => {
  it('BATCH-09: rejects injection in title', () => {
    const r = validateBatchEventRequest({
      title: '<script>alert(1)</script>',
      dates: ['2099-07-02'],
      start: '08:00',
      end: '09:00',
      location: 'Matsalen',
      responsible: 'Alla',
    });
    assert.strictEqual(r.ok, false);
    assert.ok(r.error.includes('otillåtet'));
  });
});

// ── 02-§80.24  Edit form not affected ───────────────────────────────────────

describe('02-§80.24 — Edit form unaffected', () => {
  it('DG-12: validateBatchEventRequest does not accept single date field', () => {
    const r = validateBatchEventRequest({
      title: 'Frukost',
      date: '2099-07-02',
      start: '08:00',
      end: '09:00',
      location: 'Matsalen',
      responsible: 'Alla',
    });
    // No dates array → should fail
    assert.strictEqual(r.ok, false);
  });
});

// ── 02-§6.2 updated — Day grid data attributes ─────────────────────────────

describe('02-§6.2 updated — Day grid camp date data attributes', () => {
  it('DG-13: day grid has data-start attribute', () => {
    const html = render();
    assert.ok(html.includes('data-start="2099-07-01"'), 'start date data attr');
  });

  it('DG-14: day grid has data-end attribute', () => {
    const html = render();
    assert.ok(html.includes('data-end="2099-07-07"'), 'end date data attr');
  });
});
