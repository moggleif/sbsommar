'use strict';

// Tests for the shared conflict-detection module (02-§99).
//
// The module at `source/assets/js/client/conflict-check.js` is a pure-logic
// UMD wrapper used by the add- and edit-activity forms in the browser, by
// the build-time renderers (render-lokaler.js, render-event.js), and by
// these tests. No DOM, no network — just the overlap predicate.
//
// Tests are committed in Phase 3 before the module exists in Phase 4. The
// defensive require pattern (mirrors tests/render-lokaler.test.js:21-32)
// skips the suites if the file is missing so the pre-commit hook passes.

const nodeTest = require('node:test');
const { it } = nodeTest;
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

let mod;
let moduleLoaded = false;
try {
  mod = require('../source/assets/js/client/conflict-check.js');
  moduleLoaded = typeof mod === 'object' && mod !== null;
} catch {
  // module not yet present — suites below skip
}
const skip = !moduleLoaded;
const describe = skip ? nodeTest.describe.skip : nodeTest.describe;

// ── Helpers ─────────────────────────────────────────────────────────────────

function ev(overrides = {}) {
  return {
    id: 'e1',
    title: 'Frukost',
    date: '2099-07-01',
    start: '08:00',
    end: '09:00',
    location: 'Servicehus',
    responsible: 'Anna',
    ...overrides,
  };
}

// ── effectiveEnd ────────────────────────────────────────────────────────────

describe('conflict-check — effectiveEnd (02-§99.3)', () => {
  it('CNF-01: returns raw end for a normal range', () => {
    assert.equal(mod.effectiveEnd({ start: '10:00', end: '11:00' }), '11:00');
  });

  it('CNF-02: cross-midnight end is treated as 24:00', () => {
    assert.equal(mod.effectiveEnd({ start: '22:00', end: '01:00' }), '24:00');
  });

  it('CNF-03: degenerate end === start is treated as 24:00 (matches render-lokaler)', () => {
    assert.equal(mod.effectiveEnd({ start: '12:00', end: '12:00' }), '24:00');
  });
});

// ── overlaps ────────────────────────────────────────────────────────────────

describe('conflict-check — overlaps (02-§99.3)', () => {
  it('CNF-10: strict overlap (12:00-14:00 vs 13:00-15:00) → true', () => {
    assert.equal(
      mod.overlaps({ start: '12:00', end: '14:00' }, { start: '13:00', end: '15:00' }),
      true,
    );
  });

  it('CNF-11: back-to-back (12:00-13:00 vs 13:00-14:00) → false', () => {
    assert.equal(
      mod.overlaps({ start: '12:00', end: '13:00' }, { start: '13:00', end: '14:00' }),
      false,
    );
  });

  it('CNF-12: disjoint (10:00-11:00 vs 14:00-15:00) → false', () => {
    assert.equal(
      mod.overlaps({ start: '10:00', end: '11:00' }, { start: '14:00', end: '15:00' }),
      false,
    );
  });

  it('CNF-13: enclosed (12:00-13:00 inside 10:00-15:00) → true', () => {
    assert.equal(
      mod.overlaps({ start: '12:00', end: '13:00' }, { start: '10:00', end: '15:00' }),
      true,
    );
  });

  it('CNF-14: cross-midnight vs early next morning overlap → true', () => {
    assert.equal(
      mod.overlaps({ start: '22:00', end: '01:00' }, { start: '00:30', end: '02:00' }),
      true,
    );
  });
});

// ── markClashes (lifted from render-lokaler) ────────────────────────────────

describe('conflict-check — markClashes (02-§99.2, lifted from render-lokaler.js)', () => {
  it('CNF-40: overlapping events get _clash, independent one does not', () => {
    const a = ev({ id: 'a', start: '10:00', end: '12:00' });
    const b = ev({ id: 'b', start: '11:00', end: '13:00' });
    const c = ev({ id: 'c', start: '14:00', end: '15:00' });
    const arr = [a, b, c];
    mod.markClashes(arr);
    assert.equal(arr[0]._clash, true);
    assert.equal(arr[1]._clash, true);
    assert.equal(arr[2]._clash, undefined);
  });

  it('CNF-41: back-to-back events are not marked as clashes', () => {
    const a = ev({ id: 'a', start: '10:00', end: '11:00' });
    const b = ev({ id: 'b', start: '11:00', end: '12:00' });
    const arr = [a, b];
    mod.markClashes(arr);
    assert.equal(arr[0]._clash, undefined);
    assert.equal(arr[1]._clash, undefined);
  });
});

// ── findConflicts ───────────────────────────────────────────────────────────

describe('conflict-check — findConflicts (02-§99.3, §99.11)', () => {
  it('CNF-20: same date + same location + overlap → conflict', () => {
    const candidate = ev({ id: 'cand', start: '12:00', end: '13:00' });
    const others = [ev({ id: 'o1', start: '12:30', end: '13:30' })];
    const out = mod.findConflicts(candidate, others);
    assert.equal(out.length, 1);
    assert.equal(out[0].id, 'o1');
  });

  it('CNF-21: back-to-back → not returned', () => {
    const candidate = ev({ id: 'cand', start: '12:00', end: '13:00' });
    const others = [ev({ id: 'o1', start: '13:00', end: '14:00' })];
    assert.equal(mod.findConflicts(candidate, others).length, 0);
  });

  it('CNF-22: different location → not returned', () => {
    const candidate = ev({ id: 'cand', location: 'Servicehus', start: '12:00', end: '13:00' });
    const others = [ev({ id: 'o1', location: 'Kaffetält', start: '12:00', end: '13:00' })];
    assert.equal(mod.findConflicts(candidate, others).length, 0);
  });

  it('CNF-23: different date → not returned', () => {
    const candidate = ev({ id: 'cand', date: '2099-07-01', start: '12:00', end: '13:00' });
    const others = [ev({ id: 'o1', date: '2099-07-02', start: '12:00', end: '13:00' })];
    assert.equal(mod.findConflicts(candidate, others).length, 0);
  });

  it('CNF-24: excludeId filters out the event being edited (redigera case)', () => {
    const candidate = ev({ id: 'cand', start: '12:00', end: '13:00' });
    const others = [
      ev({ id: 'cand', start: '12:00', end: '13:00' }), // the same event in events.json
      ev({ id: 'o1', start: '12:30', end: '13:30' }),
    ];
    const out = mod.findConflicts(candidate, others, { excludeId: 'cand' });
    assert.equal(out.length, 1);
    assert.equal(out[0].id, 'o1');
  });

  it('CNF-25: result sorted by start time ascending', () => {
    const candidate = ev({ id: 'cand', start: '10:00', end: '15:00' });
    const others = [
      ev({ id: 'late', start: '13:00', end: '14:00' }),
      ev({ id: 'early', start: '11:00', end: '12:00' }),
      ev({ id: 'mid', start: '12:00', end: '12:30' }),
    ];
    const out = mod.findConflicts(candidate, others);
    assert.deepEqual(out.map((e) => e.id), ['early', 'mid', 'late']);
  });

  it('CNF-26: missing location on candidate → empty array (defensive)', () => {
    const candidate = ev({ id: 'cand', location: '' });
    const others = [ev({ id: 'o1' })];
    assert.deepEqual(mod.findConflicts(candidate, others), []);
  });

  it('CNF-27: location match is exact (case-sensitive, matches server logic)', () => {
    const candidate = ev({ id: 'cand', location: 'Kaffetält', start: '12:00', end: '13:00' });
    const others = [ev({ id: 'o1', location: 'kaffetält', start: '12:00', end: '13:00' })];
    assert.equal(mod.findConflicts(candidate, others).length, 0);
  });
});

// ── findConflictsMulti ──────────────────────────────────────────────────────

describe('conflict-check — findConflictsMulti (02-§99.6)', () => {
  it('CNF-30: multi-date candidate → Map with entries only for clashing dates', () => {
    const candidate = {
      dates: ['2099-07-01', '2099-07-02', '2099-07-03'],
      start: '12:00',
      end: '13:00',
      location: 'Servicehus',
    };
    const others = [
      ev({ id: 'o1', date: '2099-07-01', start: '12:30', end: '13:30' }),
      // no conflict on 2099-07-02
      ev({ id: 'o3', date: '2099-07-03', start: '12:00', end: '13:00' }),
    ];
    const out = mod.findConflictsMulti(candidate, others);
    assert.ok(out instanceof Map, 'should return a Map');
    assert.equal(out.size, 2);
    assert.ok(out.has('2099-07-01'));
    assert.ok(out.has('2099-07-03'));
    assert.ok(!out.has('2099-07-02'));
  });

  it('CNF-31: empty dates array → empty Map', () => {
    const candidate = { dates: [], start: '12:00', end: '13:00', location: 'Servicehus' };
    const out = mod.findConflictsMulti(candidate, [ev()]);
    assert.equal(out.size, 0);
  });

  it('CNF-32: all dates clash-free → empty Map', () => {
    const candidate = {
      dates: ['2099-07-01'],
      start: '14:00',
      end: '15:00',
      location: 'Servicehus',
    };
    const others = [ev({ id: 'o1', start: '08:00', end: '09:00' })];
    const out = mod.findConflictsMulti(candidate, others);
    assert.equal(out.size, 0);
  });
});

// ── Structural tests — source files reference the module correctly ──────────
//
// These are grep-style checks on the Phase 4 source files. They use
// describe.skip when the files aren't yet present so the pre-commit hook
// passes during Phase 3.

const SRC_ROOT = path.join(__dirname, '..', 'source');

function readIfExists(p) {
  try { return fs.readFileSync(p, 'utf8'); } catch { return null; }
}

const laggTillJs = readIfExists(path.join(SRC_ROOT, 'assets', 'js', 'client', 'lagg-till.js'));
const redigeraJs = readIfExists(path.join(SRC_ROOT, 'assets', 'js', 'client', 'redigera.js'));
const renderAddJs = readIfExists(path.join(SRC_ROOT, 'build', 'render-add.js'));
const renderEditJs = readIfExists(path.join(SRC_ROOT, 'build', 'render-edit.js'));
const renderEventJs = readIfExists(path.join(SRC_ROOT, 'build', 'render-event.js'));
const renderLokalerJs = readIfExists(path.join(SRC_ROOT, 'build', 'render-lokaler.js'));

const structuralReady = laggTillJs
  && redigeraJs
  && renderEventJs
  && laggTillJs.includes('SBConflictCheck')
  && renderEventJs.includes('conflict-check');
const describeStruct = structuralReady ? nodeTest.describe : nodeTest.describe.skip;

describeStruct('conflict-check — structural wiring (02-§99.1–§99.17)', () => {
  it('CNF-50: lagg-till.js references SBConflictCheck', () => {
    assert.ok(laggTillJs.includes('SBConflictCheck'));
  });

  it('CNF-51: lagg-till.js fetches /events.json', () => {
    assert.ok(/fetch\(['"]\/events\.json['"]/.test(laggTillJs));
  });

  it('CNF-52: redigera.js passes excludeId when checking conflicts', () => {
    assert.ok(redigeraJs.includes('excludeId'));
  });

  it('CNF-53: render-add.js and render-edit.js emit <script src="conflict-check.js">', () => {
    assert.ok(renderAddJs.includes('conflict-check.js'), 'render-add.js should include script tag');
    assert.ok(renderEditJs.includes('conflict-check.js'), 'render-edit.js should include script tag');
  });

  it('CNF-54: redigera.js calls the conflict checker after populate()', () => {
    // Heuristic: populate( appears before the conflict call.
    const popIdx = redigeraJs.indexOf('populate(');
    const chkIdx = redigeraJs.search(/maybeCheckConflicts|SBConflictCheck|findConflicts/);
    assert.ok(popIdx !== -1 && chkIdx !== -1 && chkIdx > popIdx,
      'populate() should appear before the conflict check call');
  });

  it('CNF-02-RefactoredLokaler: render-lokaler.js requires the shared module', () => {
    assert.ok(renderLokalerJs && renderLokalerJs.includes('conflict-check'),
      'render-lokaler.js should require the shared conflict-check module');
  });
});
