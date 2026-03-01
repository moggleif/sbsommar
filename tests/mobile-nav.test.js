'use strict';

// Tests for mobile navigation improvements — 02-§61.1–61.11.
//
// Many requirements are CSS-only or browser-only and cannot be fully verified
// in Node.js. The tests below verify structural CSS rules exist in style.css.
//
// Manual checkpoints (browser-only):
//   MN-M01 (02-§61.1): Open any page on ≤ 767 px viewport, scroll down —
//     nav bar stays at top.
//   MN-M02 (02-§61.2): Same check on desktop (≥ 768 px).
//   MN-M03 (02-§61.9): Open hamburger on mobile — menu slides open smoothly
//     (no abrupt display toggle).
//   MN-M04 (02-§61.11): Press Escape to close, click outside to close,
//     confirm aria-expanded toggles.

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const CSS = fs.readFileSync(
  path.join(__dirname, '..', 'source', 'assets', 'cs', 'style.css'),
  'utf8',
);

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Extract the mobile media query block (max-width: 767px). */
function mobileBlock() {
  // Find the mobile media query that contains nav rules
  const re = /@media\s*\(\s*max-width:\s*767px\s*\)\s*\{/g;
  let match;
  let navBlock = null;
  while ((match = re.exec(CSS)) !== null) {
    // Walk forward to find matching closing brace
    let depth = 1;
    let i = match.index + match[0].length;
    while (i < CSS.length && depth > 0) {
      if (CSS[i] === '{') depth++;
      if (CSS[i] === '}') depth--;
      i++;
    }
    const block = CSS.slice(match.index, i);
    if (block.includes('.nav-toggle')) {
      navBlock = block;
      break;
    }
  }
  assert.ok(navBlock, 'Mobile media query with nav rules exists');
  return navBlock;
}

// ── 02-§61.1, §61.2 — Sticky navigation ─────────────────────────────────────

describe('02-§61.1–61.2 — Sticky navigation', () => {
  it('MN-01: .page-nav has position: sticky (02-§61.1, 02-§61.2)', () => {
    assert.ok(
      CSS.includes('position: sticky'),
      'Expected position: sticky on .page-nav',
    );
  });

  it('MN-02: .page-nav has top: 0 (02-§61.1, 02-§61.2)', () => {
    // Find the .page-nav block specifically
    const navIdx = CSS.indexOf('.page-nav {');
    assert.ok(navIdx !== -1, '.page-nav rule exists');
    const closingBrace = CSS.indexOf('}', navIdx);
    const navBlock = CSS.slice(navIdx, closingBrace);
    assert.ok(
      navBlock.includes('top: 0'),
      'Expected top: 0 in .page-nav block',
    );
  });

  it('MN-03: .page-nav has z-index for stacking (02-§61.1)', () => {
    const navIdx = CSS.indexOf('.page-nav {');
    assert.ok(navIdx !== -1, '.page-nav rule exists');
    const closingBrace = CSS.indexOf('}', navIdx);
    const navBlock = CSS.slice(navIdx, closingBrace);
    assert.ok(
      /z-index:\s*\d+/.test(navBlock),
      'Expected z-index in .page-nav block',
    );
  });
});

// ── 02-§61.3, §61.4 — Hamburger button design ───────────────────────────────

describe('02-§61.3–61.4 — Hamburger button design', () => {
  it('MN-04: mobile .nav-toggle has terracotta background (02-§61.3)', () => {
    const mobile = mobileBlock();
    assert.ok(
      mobile.includes('var(--color-terracotta)'),
      'Expected terracotta background on mobile .nav-toggle',
    );
  });

  it('MN-05: mobile .nav-toggle has white color (02-§61.3)', () => {
    const mobile = mobileBlock();
    assert.ok(
      mobile.includes('var(--color-white)'),
      'Expected white color on mobile .nav-toggle',
    );
  });

  it('MN-06: mobile .nav-toggle has border-radius (02-§61.4)', () => {
    const mobile = mobileBlock();
    assert.ok(
      mobile.includes('var(--radius-md)'),
      'Expected rounded corners on mobile .nav-toggle',
    );
  });
});

// ── 02-§61.5, §61.6 — Menu panel design ─────────────────────────────────────

describe('02-§61.5–61.6 — Menu panel design', () => {
  it('MN-07: mobile .nav-menu has terracotta background (02-§61.5)', () => {
    const mobile = mobileBlock();
    // nav-menu should reference terracotta
    const menuSection = mobile.slice(mobile.indexOf('.nav-menu'));
    assert.ok(
      menuSection.includes('var(--color-terracotta)'),
      'Expected terracotta background on mobile .nav-menu',
    );
  });

  it('MN-08: mobile nav links use white color (02-§61.6)', () => {
    const mobile = mobileBlock();
    // nav-link rules should include white
    const linkSection = mobile.slice(mobile.indexOf('.nav-link'));
    assert.ok(
      linkSection.includes('var(--color-white)'),
      'Expected white color on mobile nav links',
    );
  });
});

// ── 02-§61.7 — Floating card appearance ──────────────────────────────────────

describe('02-§61.7 — Floating card appearance', () => {
  it('MN-09: mobile .nav-menu has fully rounded corners (02-§61.7)', () => {
    const mobile = mobileBlock();
    assert.ok(
      mobile.includes('var(--radius-lg)'),
      'Expected radius-lg on mobile .nav-menu',
    );
  });

  it('MN-10: mobile .nav-menu has horizontal inset (02-§61.7)', () => {
    const mobile = mobileBlock();
    // Should not be left: 0 / right: 0 — should have margins/insets
    const menuBlock = mobile.slice(mobile.indexOf('.nav-menu'));
    assert.ok(
      menuBlock.includes('var(--space-xs)'),
      'Expected horizontal inset margins on mobile .nav-menu',
    );
  });
});

// ── 02-§61.8 — Visual hierarchy ──────────────────────────────────────────────

describe('02-§61.8 — Visual hierarchy: page links vs section links', () => {
  it('MN-11: mobile page links use 15px font size (02-§61.8)', () => {
    const mobile = mobileBlock();
    assert.ok(
      mobile.includes('font-size: 15px'),
      'Expected 15px font size for mobile page links',
    );
  });

  it('MN-12: mobile section links use 12px font size (02-§61.8)', () => {
    const mobile = mobileBlock();
    assert.ok(
      mobile.includes('font-size: 12px'),
      'Expected 12px font size for mobile section links',
    );
  });

  it('MN-13: mobile section links are uppercase (02-§61.8)', () => {
    const mobile = mobileBlock();
    // The section-specific rule should have uppercase
    const sectionIdx = mobile.indexOf('.nav-link--section');
    assert.ok(sectionIdx !== -1, 'Expected .nav-link--section rule in mobile');
    const sectionBlock = mobile.slice(sectionIdx, sectionIdx + 300);
    assert.ok(
      sectionBlock.includes('text-transform: uppercase'),
      'Expected uppercase on mobile section links',
    );
  });

  it('MN-14: mobile sections have a visible divider (02-§61.8)', () => {
    const mobile = mobileBlock();
    assert.ok(
      mobile.includes('border-top: 2px solid'),
      'Expected 2px border-top divider between sections',
    );
  });
});

// ── 02-§61.9 — Menu transition ───────────────────────────────────────────────

describe('02-§61.9 — Menu transition', () => {
  it('MN-15: mobile .nav-menu uses max-height transition (02-§61.9)', () => {
    const mobile = mobileBlock();
    assert.ok(
      mobile.includes('transition:') && mobile.includes('max-height'),
      'Expected max-height transition on mobile .nav-menu',
    );
  });

  it('MN-16: transition duration is 250ms (02-§61.9)', () => {
    const mobile = mobileBlock();
    assert.ok(
      mobile.includes('250ms'),
      'Expected 250ms transition duration',
    );
  });
});

// ── 02-§61.10 — Focus outlines ───────────────────────────────────────────────

describe('02-§61.10 — White focus outlines on terracotta', () => {
  it('MN-17: mobile .nav-toggle focus-visible uses white outline (02-§61.10)', () => {
    const mobile = mobileBlock();
    assert.ok(
      mobile.includes('.nav-toggle:focus-visible'),
      'Expected .nav-toggle:focus-visible rule in mobile',
    );
  });

  it('MN-18: mobile nav-link focus-visible rule exists (02-§61.10)', () => {
    const mobile = mobileBlock();
    assert.ok(
      mobile.includes('.nav-link:focus-visible'),
      'Expected .nav-link:focus-visible rule in mobile',
    );
  });
});
