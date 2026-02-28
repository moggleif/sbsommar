'use strict';

// Tests for persistent .env backup in deploy workflow (02-§53.12–53.14).
//
// These are structural checks against the workflow YAML file.
//
// Manual checkpoints:
//   ENV-M01: Full deploy to QA → verify .env.api.persistent exists at $DEPLOY_DIR/.
//   ENV-M02: Remove .env.api.bak, run deploy → verify restore uses .env.api.persistent.

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const WORKFLOW_PATH = path.resolve(
  __dirname,
  '../.github/workflows/deploy-reusable.yml',
);

const SRC = fs.readFileSync(WORKFLOW_PATH, 'utf8');

describe('02-§53.12 — Persistent .env backup created during deploy (ENV-01)', () => {
  it('ENV-01: deploy script copies .env to .env.api.persistent', () => {
    assert.ok(
      SRC.includes('.env.api.persistent'),
      'deploy-reusable.yml must reference .env.api.persistent',
    );
    assert.ok(
      SRC.includes('cp "$PUBLIC_DIR/api/.env" "$DEPLOY_DIR/.env.api.persistent"'),
      'deploy script must copy .env to persistent backup location',
    );
  });
});

describe('02-§53.13 — Restore falls back to persistent backup (ENV-02)', () => {
  it('ENV-02: restore step has elif fallback to .env.api.persistent', () => {
    assert.ok(
      SRC.includes('elif [ -f "$DEPLOY_DIR/.env.api.persistent" ]'),
      'restore step must fall back to .env.api.persistent when .bak is missing',
    );
  });
});

describe('02-§53.14 — Persistent backup uses cp, not mv (ENV-03)', () => {
  it('ENV-03: persistent restore uses cp (not mv) to preserve the backup', () => {
    // The restore from persistent must use cp so the file survives
    const restoreMatch = SRC.match(
      /elif.*\.env\.api\.persistent.*\n\s*(cp|mv).*\.env\.api\.persistent/,
    );
    assert.ok(restoreMatch, 'persistent restore line must exist');
    assert.strictEqual(
      restoreMatch[1],
      'cp',
      'persistent restore must use cp (not mv) to keep the backup intact',
    );
  });
});
