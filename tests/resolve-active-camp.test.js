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

// ── DAC-01: On-dates camp is active (02-§34.2) ─────────────────────────────

describe('resolveActiveCamp', () => {
  it('DAC-01: returns the camp whose date range contains today', () => {
    const camps = [
      camp({ id: 'past', start_date: '2026-01-01', end_date: '2026-01-07', archived: true }),
      camp({ id: 'current', start_date: '2026-06-01', end_date: '2026-06-07' }),
      camp({ id: 'future', start_date: '2026-08-01', end_date: '2026-08-07' }),
    ];
    const result = resolveActiveCamp(camps, '2026-06-03');
    assert.equal(result.id, 'current');
  });

  // ── DAC-02: Next upcoming if none on dates (02-§34.3) ───────────────────

  it('DAC-02: returns the next upcoming camp when no camp is on dates', () => {
    const camps = [
      camp({ id: 'past', start_date: '2026-01-01', end_date: '2026-01-07', archived: true }),
      camp({ id: 'june', start_date: '2026-06-01', end_date: '2026-06-07' }),
      camp({ id: 'aug', start_date: '2026-08-01', end_date: '2026-08-07' }),
    ];
    const result = resolveActiveCamp(camps, '2026-03-15');
    assert.equal(result.id, 'june');
  });

  // ── DAC-03: Most recent if no upcoming (02-§34.4) ───────────────────────

  it('DAC-03: returns the most recent camp when no upcoming camps exist', () => {
    const camps = [
      camp({ id: 'old', start_date: '2025-06-01', end_date: '2025-06-07', archived: true }),
      camp({ id: 'newer', start_date: '2025-08-01', end_date: '2025-08-07', archived: true }),
    ];
    const result = resolveActiveCamp(camps, '2026-12-01');
    assert.equal(result.id, 'newer');
  });

  // ── DAC-04: Overlapping camps — earlier start_date wins (02-§34.5) ──────

  it('DAC-04: picks the camp with the earlier start_date when ranges overlap', () => {
    const camps = [
      camp({ id: 'later-start', start_date: '2026-06-03', end_date: '2026-06-10' }),
      camp({ id: 'earlier-start', start_date: '2026-06-01', end_date: '2026-06-08' }),
    ];
    const result = resolveActiveCamp(camps, '2026-06-05');
    assert.equal(result.id, 'earlier-start');
  });

  // ── DAC-05: active field is not used (02-§34.6) ─────────────────────────

  it('DAC-05: ignores the active field entirely (derives from dates)', () => {
    const camps = [
      camp({ id: 'flagged', start_date: '2026-01-01', end_date: '2026-01-07', active: true, archived: true }),
      camp({ id: 'current', start_date: '2026-06-01', end_date: '2026-06-07' }),
    ];
    const result = resolveActiveCamp(camps, '2026-06-03');
    assert.equal(result.id, 'current');
  });

  // ── DAC-06: works without active+archived check (02-§34.8, 02-§34.13) ──

  it('DAC-06: an archived camp can be the active camp (most recent fallback)', () => {
    const camps = [
      camp({ id: 'only', start_date: '2025-06-01', end_date: '2025-06-07', archived: true }),
    ];
    const result = resolveActiveCamp(camps, '2026-12-01');
    assert.equal(result.id, 'only');
  });

  // ── DAC-07: build.js integration — today on boundary dates (02-§34.9) ──

  it('DAC-07: start_date and end_date are both inclusive', () => {
    const camps = [
      camp({ id: 'camp', start_date: '2026-06-01', end_date: '2026-06-07' }),
    ];
    // On start_date
    assert.equal(resolveActiveCamp(camps, '2026-06-01').id, 'camp');
    // On end_date
    assert.equal(resolveActiveCamp(camps, '2026-06-07').id, 'camp');
    // Day before — should fall through to upcoming
    assert.equal(resolveActiveCamp(camps, '2026-05-31').id, 'camp'); // upcoming
    // Day after — should fall through to most recent
    assert.equal(resolveActiveCamp(camps, '2026-06-08').id, 'camp'); // most recent
  });
});
