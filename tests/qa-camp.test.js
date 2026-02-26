'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { resolveActiveCamp } = require('../source/scripts/resolve-active-camp');

// Helper: build a minimal camp object
function camp(overrides) {
  return {
    id: 'test',
    name: 'Test',
    start_date: '2026-06-01',
    end_date: '2026-06-07',
    file: 'test.yaml',
    archived: false,
    ...overrides,
  };
}

// ── Production filtering (02-§42.11, 02-§42.23) ────────────────────────────

describe('resolveActiveCamp – production filtering (02-§42.11)', () => {
  it('QA-01: production excludes qa: true camps from resolution', () => {
    const camps = [
      camp({ id: 'qa', start_date: '2026-01-01', end_date: '2026-12-31', qa: true }),
      camp({ id: 'real', start_date: '2026-06-01', end_date: '2026-06-07' }),
    ];
    const result = resolveActiveCamp(camps, '2026-06-03', 'production');
    assert.equal(result.id, 'real');
  });

  it('QA-02: production resolves normally when no qa camps exist', () => {
    const camps = [
      camp({ id: 'june', start_date: '2026-06-01', end_date: '2026-06-07' }),
      camp({ id: 'aug', start_date: '2026-08-01', end_date: '2026-08-07' }),
    ];
    const result = resolveActiveCamp(camps, '2026-06-03', 'production');
    assert.equal(result.id, 'june');
  });

  it('QA-03: production ignores qa camp even when it is the only on-dates camp', () => {
    const camps = [
      camp({ id: 'qa', start_date: '2026-01-01', end_date: '2026-12-31', qa: true }),
      camp({ id: 'future', start_date: '2026-08-01', end_date: '2026-08-07' }),
    ];
    const result = resolveActiveCamp(camps, '2026-06-03', 'production');
    assert.equal(result.id, 'future');
  });
});

// ── QA resolution priority (02-§42.14, 02-§42.15, 02-§42.16, 02-§42.24) ───

describe('resolveActiveCamp – QA priority (02-§42.14)', () => {
  it('QA-04: QA camp on dates wins over non-QA camp on dates', () => {
    const camps = [
      camp({ id: 'qa', start_date: '2026-01-01', end_date: '2026-12-31', qa: true }),
      camp({ id: 'real', start_date: '2026-06-01', end_date: '2026-06-07' }),
    ];
    const result = resolveActiveCamp(camps, '2026-06-03', 'qa');
    assert.equal(result.id, 'qa');
  });

  it('QA-05: QA camp wins regardless of start_date ordering', () => {
    // The real camp has an earlier start_date, which would normally win tie-breaking.
    // In QA, the qa: true camp must still take priority.
    const camps = [
      camp({ id: 'real', start_date: '2025-06-01', end_date: '2026-12-31' }),
      camp({ id: 'qa', start_date: '2026-01-01', end_date: '2026-12-31', qa: true }),
    ];
    const result = resolveActiveCamp(camps, '2026-06-03', 'qa');
    assert.equal(result.id, 'qa');
  });

  it('QA-06: falls back to normal rules when no QA camp is on dates', () => {
    const camps = [
      camp({ id: 'qa', start_date: '2025-01-01', end_date: '2025-12-31', qa: true }),
      camp({ id: 'real', start_date: '2026-06-01', end_date: '2026-06-07' }),
    ];
    const result = resolveActiveCamp(camps, '2026-06-03', 'qa');
    assert.equal(result.id, 'real');
  });
});

// ── No environment (local dev) — backward compatibility (02-§42.21, 02-§42.25)

describe('resolveActiveCamp – no environment (02-§42.25)', () => {
  it('QA-07: without environment param, qa camps are included normally', () => {
    const camps = [
      camp({ id: 'qa', start_date: '2026-01-01', end_date: '2026-12-31', qa: true }),
      camp({ id: 'real', start_date: '2026-06-01', end_date: '2026-06-07' }),
    ];
    // Without environment, the function behaves as today — qa camp has earlier
    // start_date so it wins normal tie-breaking.
    const result = resolveActiveCamp(camps, '2026-06-03');
    assert.equal(result.id, 'qa');
  });

  it('QA-08: environment undefined behaves same as omitted', () => {
    const camps = [
      camp({ id: 'qa', start_date: '2026-01-01', end_date: '2026-12-31', qa: true }),
      camp({ id: 'real', start_date: '2026-06-01', end_date: '2026-06-07' }),
    ];
    const result = resolveActiveCamp(camps, '2026-06-03', undefined);
    assert.equal(result.id, 'qa');
  });
});

// ── qa: false and qa omitted are equivalent (02-§42.2) ─────────────────────

describe('resolveActiveCamp – qa field defaults (02-§42.2)', () => {
  it('QA-09: qa: false is treated as a normal camp (not filtered in production)', () => {
    const camps = [
      camp({ id: 'explicit-false', start_date: '2026-06-01', end_date: '2026-06-07', qa: false }),
    ];
    const result = resolveActiveCamp(camps, '2026-06-03', 'production');
    assert.equal(result.id, 'explicit-false');
  });

  it('QA-10: camp without qa field is treated as a normal camp', () => {
    const camps = [
      camp({ id: 'no-qa-field', start_date: '2026-06-01', end_date: '2026-06-07' }),
    ];
    const result = resolveActiveCamp(camps, '2026-06-03', 'production');
    assert.equal(result.id, 'no-qa-field');
  });
});

// ── Production with only QA camps throws (edge case) ───────────────────────

describe('resolveActiveCamp – edge cases', () => {
  it('QA-11: production throws when all camps are qa: true', () => {
    const camps = [
      camp({ id: 'qa1', qa: true }),
      camp({ id: 'qa2', qa: true }),
    ];
    assert.throws(
      () => resolveActiveCamp(camps, '2026-06-03', 'production'),
      /No camps found/,
    );
  });
});
