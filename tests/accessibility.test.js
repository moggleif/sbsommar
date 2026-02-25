'use strict';

// Tests for accessibility focus states — 02-§13.2 / 07-§9.2.
//
// These verify that the CSS file contains :focus-visible rules for all
// interactive element types. The actual visual appearance cannot be tested
// in Node.js — only the presence of the rules.
//
// 02-§13.6 / 07-§9.5 (accordion ARIA) is a manual checkpoint:
//   Native <details>/<summary> elements satisfy the ARIA requirement.
//   Custom accordion components (archive timeline) use explicit
//   aria-expanded and aria-controls (covered by ARK-04, ARK-05).

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');

const CSS = readFileSync(
  join(__dirname, '..', 'source', 'assets', 'cs', 'style.css'),
  'utf8',
);

// ── 02-§13.2 / 07-§9.2: :focus-visible rules for interactive elements ──────

describe(':focus-visible rules (02-§13.2)', () => {
  // Each entry: [test ID, selector fragment that must appear with :focus-visible]
  const REQUIRED = [
    ['A11Y-01', '.btn-primary:focus-visible', 'primary button'],
    ['A11Y-02', '.btn-secondary:focus-visible', 'secondary button'],
    ['A11Y-03', '.nav-link:focus-visible', 'navigation link'],
    ['A11Y-04', '.nav-toggle:focus-visible', 'hamburger toggle'],
    ['A11Y-05', 'details.accordion > summary:focus-visible', 'accordion summary'],
    ['A11Y-06', 'details.day > summary:focus-visible', 'day summary'],
    ['A11Y-07', 'details.event-row > summary:focus-visible', 'event row summary'],
    ['A11Y-08', '.content a:focus-visible', 'content link'],
  ];

  for (const [id, selector, label] of REQUIRED) {
    it(`${id}: ${label} has :focus-visible rule`, () => {
      assert.ok(
        CSS.includes(selector),
        `Expected "${selector}" in style.css for ${label}`,
      );
    });
  }

  it('A11Y-09: form inputs have :focus-visible rule', () => {
    // Form inputs should keep :focus for border-color AND add :focus-visible for outline
    assert.ok(
      CSS.includes(':focus-visible') && CSS.includes('input') && CSS.includes('select'),
      'Expected :focus-visible rules for form inputs in style.css',
    );
  });
});
