'use strict';

// Unit tests for the redundant-duplicate-PR cleanup decision (02-§110.6–110.9).
// classifyEventPr is pure, so its full decision table is tested here; the GitHub
// API wiring in the script's main() is a manual/integration checkpoint.

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const { classifyEventPr } = require('../source/scripts/close-redundant-event-prs');

const DATA = 'source/data/2026-06-syssleback/x-2026-06-22-0800.yaml';

describe('classifyEventPr — redundant duplicate cleanup (02-§110.6–110.9)', () => {
  it('DEDUPCLEAN-01: event/ branch with no changed files → close (empty net diff)', () => {
    assert.equal(classifyEventPr({ branch: 'event/2026-06-22-x-1', files: [] }), 'close');
  });

  it('DEDUPCLEAN-02: event/ branch where the only file has 0 additions+deletions → close', () => {
    const files = [{ filename: DATA, status: 'modified', additions: 0, deletions: 0 }];
    assert.equal(classifyEventPr({ branch: 'event/2026-06-22-x-1', files }), 'close');
  });

  it('DEDUPCLEAN-03: event/ branch adding a genuinely new fragment → keep', () => {
    const files = [{ filename: DATA, status: 'added', additions: 16, deletions: 0 }];
    assert.equal(classifyEventPr({ branch: 'event/2026-06-22-x-1', files }), 'keep');
  });

  it('DEDUPCLEAN-04: event/ branch modifying an existing fragment (same id, diff body) → log-manual', () => {
    const files = [{ filename: DATA, status: 'modified', additions: 3, deletions: 2 }];
    assert.equal(classifyEventPr({ branch: 'event/2026-06-22-x-1', files }), 'log-manual');
  });

  it('DEDUPCLEAN-05: a batch add with several freshly added fragments → keep', () => {
    const files = [
      { filename: 'source/data/c/a-2026-06-22-0800.yaml', status: 'added', additions: 16, deletions: 0 },
      { filename: 'source/data/c/a-2026-06-23-0800.yaml', status: 'added', additions: 16, deletions: 0 },
    ];
    assert.equal(classifyEventPr({ branch: 'event/batch-a-1', files }), 'keep');
  });

  it('DEDUPCLEAN-06: non-event branch → ignore', () => {
    const files = [{ filename: DATA, status: 'added', additions: 16, deletions: 0 }];
    assert.equal(classifyEventPr({ branch: 'fix/something', files }), 'ignore');
  });

  it('DEDUPCLEAN-07: edit/delete branches (event-edit/, event-delete/) are out of scope → ignore', () => {
    const files = [{ filename: DATA, status: 'modified', additions: 1, deletions: 1 }];
    assert.equal(classifyEventPr({ branch: 'event-edit/x-1', files }), 'ignore');
    assert.equal(classifyEventPr({ branch: 'event-delete/x-1', files }), 'ignore');
  });

  it('DEDUPCLEAN-08: event/ branch touching a non-event-data file → ignore (conservative)', () => {
    const files = [
      { filename: DATA, status: 'added', additions: 16, deletions: 0 },
      { filename: 'source/build/build.js', status: 'modified', additions: 1, deletions: 0 },
    ];
    assert.equal(classifyEventPr({ branch: 'event/2026-06-22-x-1', files }), 'ignore');
  });

  it('DEDUPCLEAN-09: missing/garbage input → ignore (no branch)', () => {
    assert.equal(classifyEventPr({}), 'ignore');
    assert.equal(classifyEventPr(), 'ignore');
    assert.equal(classifyEventPr({ branch: null, files: null }), 'ignore');
  });
});
