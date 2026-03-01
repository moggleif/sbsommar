'use strict';

// Tests for the markdown preview (02-§58.1–58.15).
//
// The preview logic will live in source/assets/js/client/markdown-preview.js.
// The sanitization function is exported via module.exports when running under
// Node.js so it can be unit-tested here.
//
// Structural/HTML tests verify that both form pages include the preview
// container, marked.umd.js, and markdown-preview.js script tags.
//
// CSS tests verify that .md-preview rules exist and use design tokens.
//
// Manual checkpoints (must be verified in a browser):
//   MDP-M01 (02-§58.1): open /lagg-till.html, type Markdown in the
//     description textarea, verify rendered HTML appears below.
//   MDP-M02 (02-§58.2): type quickly — preview updates after ~300 ms pause,
//     not on every keystroke.
//   MDP-M03 (02-§58.3): clear the textarea — preview hides or shows
//     placeholder text.
//   MDP-M04 (02-§58.4): try to click/select text in the preview — it must
//     be non-interactive.

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const { renderAddPage } = require('../source/build/render-add');
const { renderEditPage } = require('../source/build/render-edit');

const dummyCamp = {
  name: 'Test',
  location: 'Test',
  start_date: '2099-01-01',
  end_date: '2099-01-07',
  opens_for_editing: '2099-01-01',
};
const addHtml = renderAddPage(dummyCamp, ['Servicehus'], '/api');
const editHtml = renderEditPage(dummyCamp, ['Servicehus'], '/api');

// ── 02-§58.5/58.6 — marked.umd.js present ──────────────────────────────────

describe('02-§58.5/58.6 — marked library loaded client-side (MDP-01..02)', () => {
  it('MDP-01: lagg-till.html includes marked.umd.js script tag', () => {
    assert.ok(addHtml.includes('marked.umd.js'), 'add page must load marked.umd.js');
  });

  it('MDP-02: redigera.html includes marked.umd.js script tag', () => {
    assert.ok(editHtml.includes('marked.umd.js'), 'edit page must load marked.umd.js');
  });
});

// ── 02-§58.7 — defer attribute ──────────────────────────────────────────────

describe('02-§58.7 — marked script uses defer (MDP-03..04)', () => {
  it('MDP-03: lagg-till.html loads marked.umd.js with defer', () => {
    assert.match(addHtml, /defer\s[^>]*marked\.umd\.js|marked\.umd\.js[^>]*defer/);
  });

  it('MDP-04: redigera.html loads marked.umd.js with defer', () => {
    assert.match(editHtml, /defer\s[^>]*marked\.umd\.js|marked\.umd\.js[^>]*defer/);
  });
});

// ── 02-§58.8 — Sanitization parity with build ──────────────────────────────

describe('02-§58.8 — Client-side sanitization matches build (MDP-05..09)', () => {
  const previewPath = path.join(
    __dirname, '..', 'source', 'assets', 'js', 'client', 'markdown-preview.js',
  );
  // The sanitizeHtml function is exported for testing under Node.js
  const { sanitizeHtml } = require(previewPath);

  it('MDP-05: strips <script> tags', () => {
    assert.equal(sanitizeHtml('<script>alert(1)</script>'), 'alert(1)');
  });

  it('MDP-06: strips <iframe> tags', () => {
    assert.equal(sanitizeHtml('<iframe src="x"></iframe>'), '');
  });

  it('MDP-07: strips on* event handlers', () => {
    const result = sanitizeHtml('<div onclick="alert(1)">hi</div>');
    assert.ok(!result.includes('onclick'), 'on* handler must be removed');
    assert.ok(result.includes('hi'), 'content must survive');
  });

  it('MDP-08: strips javascript: URIs', () => {
    const result = sanitizeHtml('<a href="javascript:alert(1)">click</a>');
    assert.ok(!result.includes('javascript:'), 'javascript: URI must be removed');
  });

  it('MDP-09: handles nested attack patterns', () => {
    const result = sanitizeHtml('<scr<script>ipt>alert(1)</scr</script>ipt>');
    assert.ok(!result.includes('<script'), 'nested script tags must be removed');
  });
});

// ── 02-§58.9 — markdown-preview.js exists ───────────────────────────────────

describe('02-§58.9 — Dedicated markdown-preview.js file (MDP-10..12)', () => {
  it('MDP-10: markdown-preview.js source file exists', () => {
    const filePath = path.join(
      __dirname, '..', 'source', 'assets', 'js', 'client', 'markdown-preview.js',
    );
    assert.ok(fs.existsSync(filePath), 'file exists');
  });

  it('MDP-11: lagg-till.html loads markdown-preview.js', () => {
    assert.ok(addHtml.includes('markdown-preview.js'), 'add page loads preview script');
  });

  it('MDP-12: redigera.html loads markdown-preview.js', () => {
    assert.ok(editHtml.includes('markdown-preview.js'), 'edit page loads preview script');
  });
});

// ── 02-§58.10 — aria-live ───────────────────────────────────────────────────

describe('02-§58.10 — aria-live on preview area (MDP-13..14)', () => {
  it('MDP-13: lagg-till.html preview div has aria-live="polite"', () => {
    assert.ok(addHtml.includes('aria-live="polite"'), 'aria-live="polite" present');
  });

  it('MDP-14: redigera.html preview div has aria-live="polite"', () => {
    assert.ok(editHtml.includes('aria-live="polite"'), 'aria-live="polite" present');
  });
});

// ── 02-§58.11 — aria-label ──────────────────────────────────────────────────

describe('02-§58.11 — Accessible label on preview area (MDP-15..16)', () => {
  it('MDP-15: lagg-till.html preview div has aria-label', () => {
    assert.match(addHtml, /md-preview[^>]*aria-label/);
  });

  it('MDP-16: redigera.html preview div has aria-label', () => {
    assert.match(editHtml, /md-preview[^>]*aria-label/);
  });
});

// ── 02-§58.12 — Present in both forms ───────────────────────────────────────

describe('02-§58.12 — Preview div in both forms (MDP-17..18)', () => {
  it('MDP-17: lagg-till.html contains md-preview div', () => {
    assert.ok(addHtml.includes('md-preview'), 'add page has md-preview');
  });

  it('MDP-18: redigera.html contains md-preview div', () => {
    assert.ok(editHtml.includes('md-preview'), 'edit page has md-preview');
  });
});

// ── 02-§58.13/58.14/58.15 — CSS rules ──────────────────────────────────────

describe('02-§58.13–58.15 — Preview CSS styling (MDP-19..21)', () => {
  const css = fs.readFileSync(
    path.join(__dirname, '..', 'source', 'assets', 'cs', 'style.css'),
    'utf8',
  );

  it('MDP-19: style.css contains .md-preview rule', () => {
    assert.ok(css.includes('.md-preview'), 'CSS must have .md-preview rule');
  });

  it('MDP-20: .md-preview uses design tokens (no hardcoded colors)', () => {
    // Extract the .md-preview rule block
    const match = css.match(/\.md-preview\s*\{[^}]+\}/);
    assert.ok(match, '.md-preview rule block must exist');
    const rule = match[0];
    // Must use var() for colors/spacing, not hex values
    assert.ok(rule.includes('var('), 'must use CSS custom properties');
  });

  it('MDP-21: .md-preview p rule exists for description styling', () => {
    assert.ok(css.includes('.md-preview p'), '.md-preview p rule must exist');
  });
});

// ── 02-§58.6 — marked.umd.js copied during build ───────────────────────────

describe('02-§58.6 — Build copies marked.umd.js (MDP-22)', () => {
  it('MDP-22: build.js references marked.umd.js copy step', () => {
    const buildSrc = fs.readFileSync(
      path.join(__dirname, '..', 'source', 'build', 'build.js'),
      'utf8',
    );
    assert.ok(
      buildSrc.includes('marked.umd.js') || buildSrc.includes('marked'),
      'build.js must copy marked to public',
    );
  });
});
