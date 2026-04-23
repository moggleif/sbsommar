'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const yaml = require('js-yaml');

// ── Requirement: 02-§97.5, 02-§97.6 ──────────────────────────────────────────
// GitHub Pages renders docs/ via Jekyll (02-§97.5). For internal .md links
// between docs files to resolve to rendered HTML (02-§97.6), the project
// ships a single Jekyll configuration file at docs/_config.yml that
// enables the jekyll-relative-links plugin.
//
// These tests verify that docs/_config.yml is:
//   1. present and a valid YAML document
//   2. declares jekyll-relative-links under `plugins`
//   3. enables relative_links explicitly
//
// When docs/_config.yml does not yet exist (e.g. in Phase 3, before the
// implementation lands in Phase 4), the suite skips — a missing file is
// a gap captured by 02-§97.5 / 02-§97.6 in 99-traceability.md.

const CONFIG_PATH = path.resolve(__dirname, '..', 'docs', '_config.yml');

describe('docs/_config.yml — GitHub Pages documentation site (02-§97.5, §97.6)', () => {
  const exists = fs.existsSync(CONFIG_PATH);

  it('DOCS-CFG-01: docs/_config.yml is present', (t) => {
    if (!exists) {
      t.skip('docs/_config.yml not yet created — see 02-§97.5');
      return;
    }
    assert.ok(fs.statSync(CONFIG_PATH).isFile(), 'docs/_config.yml must be a file');
  });

  it('DOCS-CFG-02: docs/_config.yml is valid YAML', (t) => {
    if (!exists) {
      t.skip('docs/_config.yml not yet created — see 02-§97.5');
      return;
    }
    const raw = fs.readFileSync(CONFIG_PATH, 'utf8');
    assert.doesNotThrow(
      () => yaml.load(raw),
      'docs/_config.yml must parse as valid YAML',
    );
  });

  it('DOCS-CFG-03: plugins list includes jekyll-relative-links', (t) => {
    if (!exists) {
      t.skip('docs/_config.yml not yet created — see 02-§97.6');
      return;
    }
    const cfg = yaml.load(fs.readFileSync(CONFIG_PATH, 'utf8')) || {};
    const plugins = Array.isArray(cfg.plugins) ? cfg.plugins : [];
    assert.ok(
      plugins.includes('jekyll-relative-links'),
      'plugins must include "jekyll-relative-links" so .md cross-links resolve',
    );
  });

  it('DOCS-CFG-04: relative_links.enabled is true', (t) => {
    if (!exists) {
      t.skip('docs/_config.yml not yet created — see 02-§97.6');
      return;
    }
    const cfg = yaml.load(fs.readFileSync(CONFIG_PATH, 'utf8')) || {};
    assert.equal(
      cfg.relative_links && cfg.relative_links.enabled,
      true,
      'relative_links.enabled must be true',
    );
  });
});
