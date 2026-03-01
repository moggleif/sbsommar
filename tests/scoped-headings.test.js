'use strict';

// Tests for scoped heading sizes in event descriptions (02-§59.1–59.6).
//
// Verifies that:
//   - CSS contains scoped heading rules (h1–h4) for .md-preview,
//     .event-desc, and .event-description
//   - Heading sizes use em units and follow a strictly decreasing order
//   - The markdown guide link points to markdownguide.org
//   - The link is identical in both forms
//
// Manual checkpoints:
//   SH-M01 (02-§59.1): open /lagg-till.html, type headings (# ## ### ####)
//     in description, verify they render in strictly decreasing sizes.
//   SH-M02 (02-§59.1): open /schema.html, expand an event with headings
//     in its description, verify they render in strictly decreasing sizes
//     within the event card.

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const { renderAddPage } = require('../source/build/render-add');
const { renderEditPage } = require('../source/build/render-edit');

const css = fs.readFileSync(
  path.join(__dirname, '..', 'source', 'assets', 'cs', 'style.css'),
  'utf8',
);

const dummyCamp = {
  name: 'Test',
  location: 'Test',
  start_date: '2099-01-01',
  end_date: '2099-01-07',
  opens_for_editing: '2099-01-01',
};
const addHtml = renderAddPage(dummyCamp, ['Servicehus'], '/api');
const editHtml = renderEditPage(dummyCamp, ['Servicehus'], '/api');

// ── Helper: extract em value from a CSS rule ────────────────────────────────

function extractEmSize(cssText, selector) {
  // Match grouped selectors like ".md-preview h1,\n.event-desc h1,\n... {"
  // Find any rule block whose selector list includes our target selector.
  const escaped = selector.replace(/\./g, '\\.').replace(/\s+/g, '\\s+');
  const re = new RegExp(
    '(?:^|[},])\\s*(?:[^{}]*,\\s*)*' + escaped +
    '\\s*(?:,[^{]*)?\\{([^}]*)',
    'm',
  );
  const m = cssText.match(re);
  if (!m) return null;
  const sizeMatch = m[1].match(/font-size:\s*([\d.]+)em/);
  return sizeMatch ? parseFloat(sizeMatch[1]) : null;
}

// ── 02-§59.1 — Scoped h1–h4 rules exist ────────────────────────────────────

describe('02-§59.1 — Scoped heading rules (SH-01..12)', () => {
  const containers = ['.md-preview', '.event-desc', '.event-description'];
  const headings = ['h1', 'h2', 'h3', 'h4'];
  let testId = 1;

  for (const container of containers) {
    for (const heading of headings) {
      const selector = `${container} ${heading}`;
      const id = `SH-${String(testId).padStart(2, '0')}`;
      it(`${id}: ${selector} rule exists in style.css`, () => {
        assert.ok(
          css.includes(`${container} ${heading}`),
          `CSS must contain ${selector} rule`,
        );
      });
      testId++;
    }
  }
});

// ── 02-§59.2 — em units used ────────────────────────────────────────────────

describe('02-§59.2 — Heading sizes use em units (SH-13..15)', () => {
  const containers = ['.md-preview', '.event-desc', '.event-description'];

  containers.forEach((container, i) => {
    const id = `SH-${13 + i}`;
    it(`${id}: ${container} h1 font-size uses em`, () => {
      const size = extractEmSize(css, `${container} h1`);
      assert.ok(size !== null, `${container} h1 must use em units`);
    });
  });
});

// ── 02-§59.1 — Strictly decreasing size order ──────────────────────────────

describe('02-§59.1 — Heading sizes decrease h1 > h2 > h3 > h4 (SH-16..18)', () => {
  const containers = ['.md-preview', '.event-desc', '.event-description'];

  containers.forEach((container, i) => {
    const id = `SH-${16 + i}`;
    it(`${id}: ${container} headings follow decreasing order`, () => {
      const h1 = extractEmSize(css, `${container} h1`);
      const h2 = extractEmSize(css, `${container} h2`);
      const h3 = extractEmSize(css, `${container} h3`);
      const h4 = extractEmSize(css, `${container} h4`);

      assert.ok(h1 !== null, `${container} h1 must have em size`);
      assert.ok(h2 !== null, `${container} h2 must have em size`);
      assert.ok(h3 !== null, `${container} h3 must have em size`);
      assert.ok(h4 !== null, `${container} h4 must have em size`);
      assert.ok(h1 > h2, `h1 (${h1}em) must be larger than h2 (${h2}em)`);
      assert.ok(h2 > h3, `h2 (${h2}em) must be larger than h3 (${h3}em)`);
      assert.ok(h3 > h4, `h3 (${h3}em) must be larger than h4 (${h4}em)`);
    });
  });
});

// ── 02-§59.3 — h4 is 1em bold ──────────────────────────────────────────────

describe('02-§59.3 — h4 is body size, bold (SH-19..21)', () => {
  const containers = ['.md-preview', '.event-desc', '.event-description'];

  containers.forEach((container, i) => {
    const id = `SH-${19 + i}`;
    it(`${id}: ${container} h4 is 1em and bold`, () => {
      const size = extractEmSize(css, `${container} h4`);
      assert.equal(size, 1, `${container} h4 must be 1em`);

      // Verify bold via extracting the rule block
      const escaped = container.replace(/\./g, '\\.').replace(/\s+/g, '\\s+');
      const re = new RegExp(
        '(?:^|[},])\\s*(?:[^{}]*,\\s*)*' + escaped +
        ' h4\\s*(?:,[^{]*)?\\{([^}]*)', 'm',
      );
      const m = css.match(re);
      assert.ok(m, `${container} h4 rule block must exist`);
      assert.ok(m[1].includes('font-weight: 700'), `${container} h4 must be bold (700)`);
    });
  });
});

// ── 02-§59.4 — No hardcoded pixel sizes ────────────────────────────────────

describe('02-§59.4 — No hardcoded px in scoped headings (SH-22)', () => {
  it('SH-22: scoped heading rules do not use px for font-size', () => {
    const containers = ['.md-preview', '.event-desc', '.event-description'];
    const headings = ['h1', 'h2', 'h3', 'h4'];

    for (const container of containers) {
      for (const heading of headings) {
        const re = new RegExp(
          container.replace(/\./g, '\\.') + ' ' + heading +
          '\\s*\\{[^}]*font-size:\\s*\\d+px',
        );
        assert.ok(
          !re.test(css),
          `${container} ${heading} must not use px for font-size`,
        );
      }
    }
  });
});

// ── 02-§59.5 — Guide link points to markdownguide.org ──────────────────────

describe('02-§59.5 — Markdown guide link (SH-23..24)', () => {
  it('SH-23: lagg-till.html links to markdownguide.org', () => {
    assert.ok(
      addHtml.includes('markdownguide.org/basic-syntax'),
      'add page must link to markdownguide.org',
    );
  });

  it('SH-24: redigera.html links to markdownguide.org', () => {
    assert.ok(
      editHtml.includes('markdownguide.org/basic-syntax'),
      'edit page must link to markdownguide.org',
    );
  });
});

// ── 02-§59.6 — Identical link in both forms ────────────────────────────────

describe('02-§59.6 — Identical guide link in both forms (SH-25)', () => {
  it('SH-25: guide link href is identical in add and edit pages', () => {
    const hrefRe = /href="([^"]*markdownguide[^"]*)"/;
    const addMatch = addHtml.match(hrefRe);
    const editMatch = editHtml.match(hrefRe);

    assert.ok(addMatch, 'add page must have markdownguide href');
    assert.ok(editMatch, 'edit page must have markdownguide href');
    assert.equal(addMatch[1], editMatch[1], 'hrefs must be identical');
  });
});
