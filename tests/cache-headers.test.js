'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const HTACCESS_PATH = path.join(__dirname, '..', 'source', 'static', '.htaccess');
const BUILD_PATH = path.join(__dirname, '..', 'source', 'build', 'build.js');

// ── 02-§67.4 — .htaccess source location ───────────────────────────────────

describe('02-§67.4 — .htaccess source file', () => {
  it('CACHE-01: .htaccess exists at source/static/.htaccess', () => {
    assert.ok(fs.existsSync(HTACCESS_PATH), `Expected file at: ${HTACCESS_PATH}`);
  });
});

// ── 02-§67.1 — Image cache rules ───────────────────────────────────────────

describe('02-§67.1 — Image cache headers', () => {
  it('CACHE-02: .htaccess sets max-age=31536000 for image files', () => {
    const content = fs.readFileSync(HTACCESS_PATH, 'utf8');
    assert.ok(content.includes('31536000'), 'Expected 1-year max-age for images');
    // Should mention image extensions
    assert.ok(/webp|png|jpg|ico/i.test(content), 'Expected image file extensions');
  });
});

// ── 02-§67.2 — CSS/JS cache rules ──────────────────────────────────────────

describe('02-§67.2 — CSS/JS cache headers', () => {
  it('CACHE-03: .htaccess sets max-age=604800 for CSS and JS files', () => {
    const content = fs.readFileSync(HTACCESS_PATH, 'utf8');
    assert.ok(content.includes('604800'), 'Expected 1-week max-age for CSS/JS');
    assert.ok(/css|js/i.test(content), 'Expected CSS/JS file references');
  });
});

// ── 02-§67.3 — HTML no-cache rule ──────────────────────────────────────────

describe('02-§67.3 — HTML no-cache', () => {
  it('CACHE-04: .htaccess sets no-cache for HTML files', () => {
    const content = fs.readFileSync(HTACCESS_PATH, 'utf8');
    assert.ok(/no-cache/i.test(content), 'Expected no-cache directive for HTML');
    assert.ok(/html/i.test(content), 'Expected HTML file reference');
  });
});

// ── 02-§67.5 — Build copies .htaccess ──────────────────────────────────────

describe('02-§67.5 — Build copies .htaccess to public/', () => {
  it('CACHE-05: build.js contains logic to copy source/static/.htaccess', () => {
    const buildSrc = fs.readFileSync(BUILD_PATH, 'utf8');
    assert.ok(
      buildSrc.includes('.htaccess'),
      'Expected build.js to reference .htaccess',
    );
    assert.ok(
      buildSrc.includes('source/static') || buildSrc.includes('static'),
      'Expected build.js to reference source/static directory',
    );
  });
});

// ── 02-§67.7 — api/.htaccess not modified ──────────────────────────────────

describe('02-§67.7 — api/.htaccess unchanged', () => {
  it('CACHE-06: api/.htaccess still contains only PHP routing rules', () => {
    const apiHtaccess = path.join(__dirname, '..', 'api', '.htaccess');
    assert.ok(fs.existsSync(apiHtaccess), 'api/.htaccess must exist');
    const content = fs.readFileSync(apiHtaccess, 'utf8');
    assert.ok(content.includes('RewriteRule'), 'Expected rewrite rules');
    assert.ok(content.includes('index.php'), 'Expected PHP routing');
    assert.ok(!content.includes('Cache-Control'), 'api/.htaccess must NOT contain cache headers');
  });
});
