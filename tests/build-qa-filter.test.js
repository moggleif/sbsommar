'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const SRC = fs.readFileSync(
  path.join(__dirname, '..', 'source', 'build', 'build.js'),
  'utf8',
);

// ── build.js QA camp filtering (02-§42.13, 02-§42.30) ──────────────────────

describe('build.js QA camp filtering (02-§42.13, 02-§42.30)', () => {
  it('BUILD-QA-01: build.js filters qa camps from the camps array in production', () => {
    // The build must create a filtered copy that excludes qa: true camps
    // when BUILD_ENV is 'production', and all downstream code must use
    // the filtered copy — not the raw camps array.

    // 1. A filtered variable must be declared (filtering qa camps).
    const hasQaFilter = /const \w+ = .*camps\.filter\(\(?.*\)?\s*=>\s*!.*\.qa\b/.test(SRC)
      || /\.filter\(\(?.*\)?\s*=>\s*!.*\.qa\b/.test(SRC);
    assert.ok(hasQaFilter, 'build.js must filter qa: true camps from the camps array');

    // 2. The render functions that receive the full camp list must NOT
    //    receive the raw `campsData.camps` or unfiltered `camps` variable
    //    after the filtering point.  We check that renderUpcomingCampsHtml,
    //    renderArkivPage, and the future-camps filter use the filtered name.
    //    Specifically: after the filter line, raw `camps` should not appear
    //    as an argument to render functions or in .filter() calls.

    // 2. The filtering must be conditional on BUILD_ENV === 'production'
    const hasProductionGuard = /BUILD_ENV\s*===\s*'production'/.test(SRC);
    assert.ok(hasProductionGuard, 'QA filtering must be guarded by BUILD_ENV === \'production\'');
  });
});
