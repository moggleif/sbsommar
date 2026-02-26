'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

// The module under test — will be implemented in Phase 4.
const { validateCamps } = require('../source/scripts/validate-camps');

// ── Helpers ─────────────────────────────────────────────────────────────────

function makeCamp(overrides = {}) {
  return {
    id: '2026-08-test',
    name: 'Test Camp',
    start_date: '2026-08-01',
    end_date: '2026-08-07',
    opens_for_editing: '2026-07-25',
    location: 'Testville',
    file: '2026-08-test.yaml',
    archived: false,
    information: '',
    link: '',
    ...overrides,
  };
}

// Minimal in-memory file system for testing.
// Keys are filenames (not full paths), values are YAML strings.
function run(camps, files = {}) {
  return validateCamps(camps, files);
}

// ── 36.1 — Required fields ─────────────────────────────────────────────────

describe('validateCamps – required fields (02-§36.1)', () => {
  const REQUIRED = ['id', 'name', 'start_date', 'end_date', 'opens_for_editing', 'location', 'file', 'archived'];

  for (const field of REQUIRED) {
    it(`VCMP-${REQUIRED.indexOf(field) + 1}: rejects camp missing "${field}"`, () => {
      const camp = makeCamp();
      delete camp[field];
      const result = run([camp]);
      assert.equal(result.ok, false);
      assert.ok(result.errors.some(e => e.includes(field)), `Expected error mentioning "${field}"`);
    });
  }
});

// ── 36.2 — Date format ─────────────────────────────────────────────────────

describe('validateCamps – date format (02-§36.2)', () => {
  it('VCMP-09: rejects invalid start_date format', () => {
    const result = run([makeCamp({ start_date: '2026/08/01' })]);
    assert.equal(result.ok, false);
    assert.ok(result.errors.some(e => e.includes('start_date')));
  });

  it('VCMP-10: rejects invalid end_date format', () => {
    const result = run([makeCamp({ end_date: 'Aug 7' })]);
    assert.equal(result.ok, false);
    assert.ok(result.errors.some(e => e.includes('end_date')));
  });

  it('VCMP-11: rejects invalid opens_for_editing format', () => {
    const result = run([makeCamp({ opens_for_editing: 'nope' })]);
    assert.equal(result.ok, false);
    assert.ok(result.errors.some(e => e.includes('opens_for_editing')));
  });

  it('VCMP-12: accepts valid YYYY-MM-DD dates', () => {
    const result = run([makeCamp()]);
    assert.equal(result.ok, true);
  });
});

// ── 36.3 — end_date >= start_date ───────────────────────────────────────────

describe('validateCamps – date ordering (02-§36.3)', () => {
  it('VCMP-13: rejects end_date before start_date', () => {
    const result = run([makeCamp({ start_date: '2026-08-10', end_date: '2026-08-01' })]);
    assert.equal(result.ok, false);
    assert.ok(result.errors.some(e => e.includes('end_date')));
  });

  it('VCMP-14: accepts end_date equal to start_date', () => {
    const result = run([makeCamp({ start_date: '2026-08-01', end_date: '2026-08-01' })]);
    assert.equal(result.ok, true);
  });
});

// ── 36.4 — archived is boolean ─────────────────────────────────────────────

describe('validateCamps – archived type (02-§36.4)', () => {
  it('VCMP-15: rejects non-boolean archived', () => {
    const result = run([makeCamp({ archived: 'yes' })]);
    assert.equal(result.ok, false);
    assert.ok(result.errors.some(e => e.includes('archived')));
  });

  it('VCMP-16: accepts true and false', () => {
    assert.equal(run([makeCamp({ archived: true })]).ok, true);
    assert.equal(run([makeCamp({ archived: false })]).ok, true);
  });
});

// ── 36.5 — Unique IDs ──────────────────────────────────────────────────────

describe('validateCamps – unique ids (02-§36.5)', () => {
  it('VCMP-17: rejects duplicate camp ids', () => {
    const a = makeCamp({ id: 'dup', file: 'a.yaml' });
    const b = makeCamp({ id: 'dup', file: 'b.yaml' });
    const result = run([a, b]);
    assert.equal(result.ok, false);
    assert.ok(result.errors.some(e => e.includes('id') && e.includes('dup')));
  });
});

// ── 36.6 — Unique file values ───────────────────────────────────────────────

describe('validateCamps – unique file values (02-§36.6)', () => {
  it('VCMP-18: rejects duplicate file references', () => {
    const a = makeCamp({ id: 'a', file: 'same.yaml' });
    const b = makeCamp({ id: 'b', file: 'same.yaml' });
    const result = run([a, b]);
    assert.equal(result.ok, false);
    assert.ok(result.errors.some(e => e.includes('file') && e.includes('same.yaml')));
  });
});

// ── 36.7 — Non-zero exit on error (tested via ok: false) ───────────────────

describe('validateCamps – exit behaviour (02-§36.7)', () => {
  it('VCMP-19: returns ok:false when validation fails', () => {
    const camp = makeCamp();
    delete camp.id;
    const result = run([camp]);
    assert.equal(result.ok, false);
    assert.ok(Array.isArray(result.errors));
    assert.ok(result.errors.length > 0);
  });

  it('VCMP-20: returns ok:true when validation passes', () => {
    const result = run([makeCamp()]);
    assert.equal(result.ok, true);
  });
});

// ── 36.8 — Missing file creation ───────────────────────────────────────────

describe('validateCamps – file creation (02-§36.8)', () => {
  it('VCMP-21: creates entry in files map when file is missing', () => {
    const files = {};
    const result = run([makeCamp()], files);
    assert.equal(result.ok, true);
    assert.ok('2026-08-test.yaml' in files, 'File should have been created');
  });
});

// ── 36.9 — Created file has camp header from camps.yaml ────────────────────

describe('validateCamps – created file content (02-§36.9)', () => {
  it('VCMP-22: created file has correct camp header', () => {
    const files = {};
    const camp = makeCamp();
    run([camp], files);
    const content = files['2026-08-test.yaml'];
    assert.ok(content.includes('id: 2026-08-test'));
    assert.ok(content.includes('name: Test Camp'));
    assert.ok(content.includes('location: Testville'));
    assert.ok(content.includes("start_date: '2026-08-01'"));
    assert.ok(content.includes("end_date: '2026-08-07'"));
  });
});

// ── 36.10 — Created file has empty events ───────────────────────────────────

describe('validateCamps – created file events (02-§36.10)', () => {
  it('VCMP-23: created file has events: []', () => {
    const files = {};
    run([makeCamp()], files);
    const content = files['2026-08-test.yaml'];
    assert.ok(content.includes('events: []'));
  });
});

// ── 36.11 — Field order ────────────────────────────────────────────────────

describe('validateCamps – field order (02-§36.11)', () => {
  it('VCMP-24: camp header fields appear in correct order', () => {
    const files = {};
    run([makeCamp()], files);
    const content = files['2026-08-test.yaml'];
    const idPos = content.indexOf('id:');
    const namePos = content.indexOf('name:');
    const locPos = content.indexOf('location:');
    const startPos = content.indexOf('start_date:');
    const endPos = content.indexOf('end_date:');
    assert.ok(idPos < namePos, 'id before name');
    assert.ok(namePos < locPos, 'name before location');
    assert.ok(locPos < startPos, 'location before start_date');
    assert.ok(startPos < endPos, 'start_date before end_date');
  });
});

// ── 36.12–36.13 — Source of truth / comparison ─────────────────────────────

describe('validateCamps – camp header sync (02-§36.12, 02-§36.13)', () => {
  it('VCMP-25: detects when existing file header differs from camps.yaml', () => {
    const camp = makeCamp();
    const files = {
      '2026-08-test.yaml': [
        'camp:',
        '  id: 2026-08-test',
        '  name: Old Name',
        '  location: Testville',
        "  start_date: '2026-08-01'",
        "  end_date: '2026-08-07'",
        'events: []',
      ].join('\n'),
    };
    const result = run([camp], files);
    assert.equal(result.ok, true);
    // After sync, name should match camps.yaml
    assert.ok(files['2026-08-test.yaml'].includes('name: Test Camp'));
  });
});

// ── 36.14 — Sync updates, preserves events ─────────────────────────────────

describe('validateCamps – sync preserves events (02-§36.14)', () => {
  it('VCMP-26: syncs header but preserves events section', () => {
    const camp = makeCamp({ name: 'New Name' });
    const files = {
      '2026-08-test.yaml': [
        'camp:',
        '  id: 2026-08-test',
        '  name: Old Name',
        '  location: Testville',
        "  start_date: '2026-08-01'",
        "  end_date: '2026-08-07'",
        'events:',
        '  - id: test-event-2026-08-01-1400',
        '    title: Test Event',
        "    date: '2026-08-01'",
        "    start: '14:00'",
        "    end: '15:00'",
        '    location: Somewhere',
        '    responsible: Someone',
      ].join('\n'),
    };
    const result = run([camp], files);
    assert.equal(result.ok, true);
    const content = files['2026-08-test.yaml'];
    assert.ok(content.includes('name: New Name'), 'Header should be updated');
    assert.ok(content.includes('title: Test Event'), 'Event should be preserved');
    assert.ok(content.includes('id: test-event-2026-08-01-1400'), 'Event id should be preserved');
  });
});

// ── 36.15 — Field order after sync ─────────────────────────────────────────

describe('validateCamps – field order after sync (02-§36.15)', () => {
  it('VCMP-27: synced header has correct field order', () => {
    const camp = makeCamp();
    const files = {
      '2026-08-test.yaml': [
        'camp:',
        "  end_date: '2026-08-07'",
        '  id: 2026-08-test',
        '  location: Testville',
        '  name: Test Camp',
        "  start_date: '2026-08-01'",
        'events: []',
      ].join('\n'),
    };
    run([camp], files);
    const content = files['2026-08-test.yaml'];
    const idPos = content.indexOf('id:');
    const namePos = content.indexOf('name:');
    const locPos = content.indexOf('location:');
    const startPos = content.indexOf('start_date:');
    const endPos = content.indexOf('end_date:');
    assert.ok(idPos < namePos, 'id before name');
    assert.ok(namePos < locPos, 'name before location');
    assert.ok(locPos < startPos, 'location before start_date');
    assert.ok(startPos < endPos, 'start_date before end_date');
  });
});

// ── 36.17 — Logging ────────────────────────────────────────────────────────

describe('validateCamps – logging (02-§36.17)', () => {
  it('VCMP-28: returns log messages for actions taken', () => {
    const files = {};
    const result = run([makeCamp()], files);
    assert.ok(Array.isArray(result.log));
    assert.ok(result.log.length > 0, 'Should have at least one log message');
    assert.ok(result.log.some(m => m.includes('creat') || m.includes('Creat')));
  });
});

// ── 36.18 — Module import ──────────────────────────────────────────────────

describe('validateCamps – module API (02-§36.18)', () => {
  it('VCMP-29: exports validateCamps function', () => {
    assert.equal(typeof validateCamps, 'function');
  });
});

// ── Edge cases ──────────────────────────────────────────────────────────────

describe('validateCamps – edge cases', () => {
  it('VCMP-30: handles empty camps array', () => {
    const result = run([]);
    assert.equal(result.ok, true);
  });

  it('VCMP-31: does not touch file when header already matches', () => {
    const camp = makeCamp();
    const originalContent = [
      'camp:',
      '  id: 2026-08-test',
      '  name: Test Camp',
      '  location: Testville',
      "  start_date: '2026-08-01'",
      "  end_date: '2026-08-07'",
      'events: []',
    ].join('\n');
    const files = { '2026-08-test.yaml': originalContent };
    const result = run([camp], files);
    assert.equal(result.ok, true);
    // Log should not mention sync for this file
    assert.ok(!result.log.some(m => m.includes('sync') || m.includes('Sync') || m.includes('updat') || m.includes('Updat')),
      'Should not log sync when header matches');
  });

  it('VCMP-32: multiple camps validated independently', () => {
    const a = makeCamp({ id: 'camp-a', file: 'a.yaml' });
    const b = makeCamp({ id: 'camp-b', file: 'b.yaml', start_date: 'bad' });
    const result = run([a, b]);
    assert.equal(result.ok, false);
    // Error should reference camp-b, not camp-a
    assert.ok(result.errors.some(e => e.includes('camp-b')));
  });
});
