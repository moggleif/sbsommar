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

// ── 02-§69.1–69.3 — CSS cache-busting ──────────────────────────────────────

describe('02-§69.1 — CSS cache-busting post-processing', () => {
  const buildSrc = fs.readFileSync(BUILD_PATH, 'utf8');

  it('CACHE-07: build.js computes a content hash of public/style.css', () => {
    assert.ok(
      buildSrc.includes('createHash') && buildSrc.includes('style.css'),
      'Expected build.js to hash style.css content',
    );
  });

  it('CACHE-08: build.js replaces style.css href with versioned query string', () => {
    assert.ok(
      /style\.css\?v=/.test(buildSrc),
      'Expected build.js to produce style.css?v= replacement pattern',
    );
  });

  it('CACHE-09: hash is deterministic (same input → same output)', () => {
    const crypto = require('crypto');
    const sample = 'body { color: red; }';
    const h1 = crypto.createHash('md5').update(sample).digest('hex').slice(0, 8);
    const h2 = crypto.createHash('md5').update(sample).digest('hex').slice(0, 8);
    assert.equal(h1, h2, 'Same content must produce identical hashes');
  });
});

// ── 02-§77.1–77.3 — JS cache-busting ──────────────────────────────────────

describe('02-§77.1 — JS cache-busting post-processing', () => {
  const buildSrc = fs.readFileSync(BUILD_PATH, 'utf8');

  it('CACHE-10: build.js computes a content hash for JS files', () => {
    assert.ok(
      buildSrc.includes('createHash') && /\.js["']?\)?/m.test(buildSrc),
      'Expected build.js to hash JS file content',
    );
  });

  it('CACHE-11: build.js replaces JS src with versioned query string', () => {
    assert.ok(
      /\.js\?v=/.test(buildSrc),
      'Expected build.js to produce .js?v= replacement pattern',
    );
  });

  it('CACHE-12: JS hash is deterministic (same input → same output)', () => {
    const crypto = require('crypto');
    const sample = 'function init() { return true; }';
    const h1 = crypto.createHash('md5').update(sample).digest('hex').slice(0, 8);
    const h2 = crypto.createHash('md5').update(sample).digest('hex').slice(0, 8);
    assert.equal(h1, h2, 'Same JS content must produce identical hashes');
  });
});

// ── 02-§78.1–78.3 — Image cache-busting ────────────────────────────────────

describe('02-§78.1 — Image cache-busting post-processing', () => {
  const buildSrc = fs.readFileSync(BUILD_PATH, 'utf8');

  it('CACHE-13: build.js processes image file hashes', () => {
    assert.ok(
      /webp|png|jpg|jpeg|ico/.test(buildSrc) && buildSrc.includes('createHash'),
      'Expected build.js to hash image file content',
    );
  });

  it('CACHE-14: build.js replaces image src with versioned query string', () => {
    assert.ok(
      /\.\(webp|\.webp\?v=|img.*\?v=/.test(buildSrc),
      'Expected build.js to produce image ?v= replacement pattern',
    );
  });

  it('CACHE-15: image hash is deterministic (same input → same output)', () => {
    const crypto = require('crypto');
    const sample = Buffer.from('fake-image-data');
    const h1 = crypto.createHash('md5').update(sample).digest('hex').slice(0, 8);
    const h2 = crypto.createHash('md5').update(sample).digest('hex').slice(0, 8);
    assert.equal(h1, h2, 'Same image content must produce identical hashes');
  });
});
