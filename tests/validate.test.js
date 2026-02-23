'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const { validateEventRequest } = require('../source/api/validate');

// ── Helpers ───────────────────────────────────────────────────────────────────

function valid(overrides = {}) {
  return {
    title: 'Frukost',
    date: '2025-06-22',
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

// ── Happy path ────────────────────────────────────────────────────────────────

describe('validateEventRequest – happy path', () => {
  it('accepts a fully populated valid request', () => {
    const r = validateEventRequest({
      title: 'Morgonmöte',
      date: '2026-02-24',
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
