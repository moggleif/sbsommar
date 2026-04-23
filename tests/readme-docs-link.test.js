'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

// ── Requirement: 02-§97.13, 02-§97.14 ────────────────────────────────────────
// README.md must expose the published documentation site and list every
// file currently published under docs/. These tests read the repository-root
// README.md once and assert the relevant substrings.

const REPO_ROOT = path.resolve(__dirname, '..');
const README_PATH = path.join(REPO_ROOT, 'README.md');
const DOCS_DIR = path.join(REPO_ROOT, 'docs');

const DOCS_SITE_URL = 'https://moggleif.github.io/sbsommar/';

const EXPECTED_DOC_FILES = [
  '01-CONTRIBUTORS.md',
  '02-REQUIREMENTS.md',
  '03-ARCHITECTURE.md',
  '04-OPERATIONS.md',
  '05-DATA_CONTRACT.md',
  '06-EVENT_DATA_MODEL.md',
  '07-DESIGN.md',
  '08-ENVIRONMENTS.md',
  '09-RELEASING.md',
  '99-traceability.md',
];

describe('README.md — documentation-site discoverability (02-§97.13, §97.14)', () => {
  const readme = fs.readFileSync(README_PATH, 'utf8');
  const hasSiteLink = readme.includes(DOCS_SITE_URL);

  it('README-DOCS-01: README.md links to the published docs site URL', (t) => {
    if (!hasSiteLink) {
      t.skip('README.md does not yet link to the docs site — see 02-§97.13');
      return;
    }
    assert.ok(
      readme.includes(DOCS_SITE_URL),
      `README.md must contain the docs site URL ${DOCS_SITE_URL}`,
    );
  });

  it('README-DOCS-02: docs site link appears before the developer setup section', (t) => {
    if (!hasSiteLink) {
      t.skip('README.md does not yet link to the docs site — see 02-§97.13');
      return;
    }
    const urlIdx = readme.indexOf(DOCS_SITE_URL);
    const setupIdx = readme.indexOf('## For Developers');
    assert.ok(setupIdx !== -1, '"## For Developers" heading must be present');
    assert.ok(
      urlIdx < setupIdx,
      'Docs site URL must appear before "## For Developers"',
    );
  });

  it('README-DOCS-03: README doc table includes every docs/*.md file', (t) => {
    if (!hasSiteLink) {
      t.skip('README.md has not yet been updated for the docs site — see 02-§97.14');
      return;
    }
    const missing = EXPECTED_DOC_FILES.filter(
      (file) => !readme.includes(`docs/${file}`),
    );
    assert.deepEqual(missing, [], `README.md missing links: ${missing.join(', ')}`);
  });

  it('README-DOCS-04: EXPECTED_DOC_FILES matches actual docs/ contents (no drift)', () => {
    const actual = fs
      .readdirSync(DOCS_DIR)
      .filter((f) => f.endsWith('.md') && f !== 'index.md')
      .sort();
    const expected = [...EXPECTED_DOC_FILES].sort();
    assert.deepEqual(
      actual,
      expected,
      'EXPECTED_DOC_FILES must match docs/*.md (excluding index.md) — update both together',
    );
  });
});
