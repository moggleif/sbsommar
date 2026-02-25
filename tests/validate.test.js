'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const { validateEventRequest, validateEditRequest } = require('../source/api/validate');

// ── Helpers ───────────────────────────────────────────────────────────────────

function valid(overrides = {}) {
  return {
    title: 'Frukost',
    date: '2099-06-22',
    start: '08:00',
    end: '09:00',
    location: 'Matsalen',
    responsible: 'Alla',
    ...overrides,
  };
}

// ── Body guard ────────────────────────────────────────────────────────────────

describe('validateEventRequest – body guard', () => {
  it('rejects null body', () => {
    const r = validateEventRequest(null);
    assert.strictEqual(r.ok, false);
    assert.ok(r.error.length > 0);
  });

  it('rejects non-object body', () => {
    const r = validateEventRequest('string');
    assert.strictEqual(r.ok, false);
  });

  it('rejects missing body (undefined)', () => {
    const r = validateEventRequest(undefined);
    assert.strictEqual(r.ok, false);
  });
});

// ── Required fields ───────────────────────────────────────────────────────────

describe('validateEventRequest – required fields', () => {
  it('rejects missing title', () => {
    const r = validateEventRequest(valid({ title: '' }));
    assert.strictEqual(r.ok, false);
    assert.ok(r.error.includes('title'));
  });

  it('rejects whitespace-only title', () => {
    const r = validateEventRequest(valid({ title: '   ' }));
    assert.strictEqual(r.ok, false);
    assert.ok(r.error.includes('title'));
  });

  it('rejects non-string title', () => {
    const r = validateEventRequest(valid({ title: 42 }));
    assert.strictEqual(r.ok, false);
    assert.ok(r.error.includes('title'));
  });

  it('rejects missing date', () => {
    const r = validateEventRequest(valid({ date: '' }));
    assert.strictEqual(r.ok, false);
    assert.ok(r.error.includes('date'));
  });

  it('rejects missing start', () => {
    const r = validateEventRequest(valid({ start: '' }));
    assert.strictEqual(r.ok, false);
    assert.ok(r.error.includes('start'));
  });

  it('rejects missing end', () => {
    const r = validateEventRequest(valid({ end: '' }));
    assert.strictEqual(r.ok, false);
    assert.ok(r.error.includes('end'));
  });

  it('rejects missing location', () => {
    const r = validateEventRequest(valid({ location: '' }));
    assert.strictEqual(r.ok, false);
    assert.ok(r.error.includes('location'));
  });

  it('rejects missing responsible', () => {
    const r = validateEventRequest(valid({ responsible: '' }));
    assert.strictEqual(r.ok, false);
    assert.ok(r.error.includes('responsible'));
  });
});

// ── Date format ───────────────────────────────────────────────────────────────

describe('validateEventRequest – date validation', () => {
  it('rejects date in wrong format (DD-MM-YYYY)', () => {
    const r = validateEventRequest(valid({ date: '22-06-2025' }));
    assert.strictEqual(r.ok, false);
    assert.ok(r.error.includes('YYYY-MM-DD'));
  });

  it('rejects date in wrong format (YYYY/MM/DD)', () => {
    const r = validateEventRequest(valid({ date: '2025/06/22' }));
    assert.strictEqual(r.ok, false);
  });

  it('rejects date with text', () => {
    const r = validateEventRequest(valid({ date: 'not-a-date' }));
    assert.strictEqual(r.ok, false);
  });

  it('rejects structurally valid but calendar-impossible date', () => {
    // 2025-13-01 matches the regex but is not a real date
    const r = validateEventRequest(valid({ date: '2025-13-01' }));
    assert.strictEqual(r.ok, false);
  });

  it('accepts a valid ISO date', () => {
    const r = validateEventRequest(valid({ date: '2025-06-22' }));
    assert.strictEqual(r.ok, true);
  });
});

// ── Time ordering ─────────────────────────────────────────────────────────────

describe('validateEventRequest – time ordering', () => {
  it('rejects end equal to start', () => {
    const r = validateEventRequest(valid({ start: '09:00', end: '09:00' }));
    assert.strictEqual(r.ok, false);
    assert.ok(r.error.includes('end'));
  });

  it('rejects end before start', () => {
    const r = validateEventRequest(valid({ start: '10:00', end: '09:00' }));
    assert.strictEqual(r.ok, false);
  });

  it('accepts end one minute after start', () => {
    const r = validateEventRequest(valid({ start: '08:00', end: '08:01' }));
    assert.strictEqual(r.ok, true);
  });

  it('accepts events near midnight (23:00 → 23:59)', () => {
    const r = validateEventRequest(valid({ start: '23:00', end: '23:59' }));
    assert.strictEqual(r.ok, true);
  });

  it('accepts events starting at 00:00', () => {
    const r = validateEventRequest(valid({ start: '00:00', end: '01:00' }));
    assert.strictEqual(r.ok, true);
  });
});

// ── Optional fields ───────────────────────────────────────────────────────────

describe('validateEventRequest – optional fields', () => {
  it('accepts request with no optional fields', () => {
    const r = validateEventRequest({
      title: 'Frukost',
      date: '2025-06-22',
      start: '08:00',
      end: '09:00',
      location: 'Matsalen',
      responsible: 'Alla',
    });
    assert.strictEqual(r.ok, true);
  });

  it('accepts valid description string', () => {
    const r = validateEventRequest(valid({ description: 'Kom hungrig.' }));
    assert.strictEqual(r.ok, true);
  });

  it('rejects non-string description', () => {
    const r = validateEventRequest(valid({ description: 123 }));
    assert.strictEqual(r.ok, false);
    assert.ok(r.error.includes('description'));
  });

  it('accepts valid link string', () => {
    const r = validateEventRequest(valid({ link: 'https://example.com' }));
    assert.strictEqual(r.ok, true);
  });

  it('rejects non-string link', () => {
    const r = validateEventRequest(valid({ link: true }));
    assert.strictEqual(r.ok, false);
    assert.ok(r.error.includes('link'));
  });

  it('accepts valid ownerName string', () => {
    const r = validateEventRequest(valid({ ownerName: 'Anna Andersson' }));
    assert.strictEqual(r.ok, true);
  });

  it('rejects non-string ownerName', () => {
    const r = validateEventRequest(valid({ ownerName: [] }));
    assert.strictEqual(r.ok, false);
    assert.ok(r.error.includes('ownerName'));
  });
});

// ── validateEditRequest – end time required ────────────────────────────────────

function validEdit(overrides = {}) {
  return {
    id: '2099-08-04-frukost',
    title: 'Frukost',
    date: '2099-06-22',
    start: '08:00',
    end: '09:00',
    location: 'Matsalen',
    responsible: 'Alla',
    ...overrides,
  };
}

describe('validateEditRequest – end time required', () => {
  it('VLD-27: rejects empty end', () => {
    const r = validateEditRequest(validEdit({ end: '' }));
    assert.strictEqual(r.ok, false);
    assert.ok(r.error.includes('end'));
  });

  it('VLD-28: rejects absent end', () => {
    const r = validateEditRequest(validEdit({ end: undefined }));
    assert.strictEqual(r.ok, false);
    assert.ok(r.error.includes('end'));
  });

  it('VLD-29: rejects end equal to start', () => {
    const r = validateEditRequest(validEdit({ start: '09:00', end: '09:00' }));
    assert.strictEqual(r.ok, false);
    assert.ok(r.error.includes('end'));
  });

  it('VLD-30: rejects end before start', () => {
    const r = validateEditRequest(validEdit({ start: '10:00', end: '09:00' }));
    assert.strictEqual(r.ok, false);
  });

  it('VLD-31: accepts end one minute after start', () => {
    const r = validateEditRequest(validEdit({ start: '08:00', end: '08:01' }));
    assert.strictEqual(r.ok, true);
  });

  it('VLD-32: accepts a fully valid edit request', () => {
    const r = validateEditRequest(validEdit());
    assert.deepStrictEqual(r, { ok: true });
  });
});

// ── Past-date blocking (02-§26.4, 02-§26.5, 02-§26.6) ──────────────────────

describe('validateEventRequest – past-date blocking', () => {
  it('PDT-03: rejects a date in the past', () => {
    const r = validateEventRequest(valid({ date: '2020-01-01' }));
    assert.strictEqual(r.ok, false);
    assert.ok(r.error.includes('förflutna'));
  });

  it('PDT-04: accepts today\'s date', () => {
    const today = new Date().toISOString().slice(0, 10);
    const r = validateEventRequest(valid({ date: today }));
    assert.strictEqual(r.ok, true);
  });
});

describe('validateEditRequest – past-date blocking', () => {
  it('PDT-05: rejects a date in the past', () => {
    const r = validateEditRequest(validEdit({ date: '2020-01-01' }));
    assert.strictEqual(r.ok, false);
    assert.ok(r.error.includes('förflutna'));
  });

  it('PDT-06: accepts today\'s date', () => {
    const today = new Date().toISOString().slice(0, 10);
    const r = validateEditRequest(validEdit({ date: today }));
    assert.strictEqual(r.ok, true);
  });
});

// ── Happy path ────────────────────────────────────────────────────────────────

describe('validateEventRequest – happy path', () => {
  it('accepts a fully populated valid request', () => {
    const r = validateEventRequest({
      title: 'Morgonmöte',
      date: '2099-06-22',
      start: '08:30',
      end: '09:00',
      location: 'GA Datorsal',
      responsible: 'Lisa Lautrup',
      description: 'Ta med din dator.',
      link: 'https://meet.example.com',
      ownerName: 'Lisa Lautrup',
    });
    assert.strictEqual(r.ok, true);
  });

  it('returns { ok: true } with no extra fields on success', () => {
    const r = validateEventRequest(valid());
    assert.deepStrictEqual(r, { ok: true });
  });
});
