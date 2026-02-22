'use strict';

const fs = require('fs');
const path = require('path');
const assert = require('node:assert/strict');

const SNAPSHOTS_DIR = path.join(__dirname, '..', '__snapshots__');

/**
 * On first run (or with UPDATE_SNAPSHOTS=1): writes value to disk.
 * On subsequent runs: compares value against stored snapshot.
 *
 * To update: UPDATE_SNAPSHOTS=1 npm test
 */
function matchSnapshot(value, name) {
  const file = path.join(SNAPSHOTS_DIR, `${name}.snap`);

  if (process.env.UPDATE_SNAPSHOTS === '1' || !fs.existsSync(file)) {
    fs.mkdirSync(SNAPSHOTS_DIR, { recursive: true });
    fs.writeFileSync(file, value, 'utf8');
    return;
  }

  const stored = fs.readFileSync(file, 'utf8');
  assert.strictEqual(
    value,
    stored,
    `Snapshot mismatch: "${name}". Run UPDATE_SNAPSHOTS=1 npm test to regenerate.`,
  );
}

module.exports = { matchSnapshot };
