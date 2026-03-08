'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const {
  renderIndexPage,
} = require('../source/build/render-index');

const CSS = fs.readFileSync(
  path.join(__dirname, '..', 'source', 'assets', 'cs', 'style.css'),
  'utf8',
);

// ── Helper: build a minimal page with hero + action buttons ─────────────────

function buildPage(opts = {}) {
  return {
    heroSrc: opts.heroSrc ?? 'images/hero.webp',
    heroAlt: opts.heroAlt ?? 'Hero',
    sections: [{ id: 'start', navLabel: 'Start', html: '<p>Intro</p>' }],
    discordUrl: null,
    facebookUrl: null,
    countdownTarget: null,
    opensForEditing: 'opensForEditing' in opts ? opts.opensForEditing : '2026-06-14',
    editingCloses: 'editingCloses' in opts ? opts.editingCloses : '2026-06-22',
  };
}

// ── 02-§71.1 — Buttons appear below hero image ─────────────────────────────

describe('hero action buttons – structure (02-§71.1)', () => {
  it('HERO-BTN-01: renders a .hero-actions container below the hero image', () => {
    const html = renderIndexPage(buildPage());
    assert.ok(
      html.includes('class="hero-actions"'),
      'Expected .hero-actions container',
    );
    // The hero-actions div must come after the hero-img
    const imgPos = html.indexOf('class="hero-img"');
    const actionsPos = html.indexOf('class="hero-actions"');
    assert.ok(imgPos > 0 && actionsPos > imgPos, 'hero-actions must appear after hero-img');
  });
});

// ── 02-§71.2 — Buttons link to schema, idag, lagg-till ─────────────────────

describe('hero action buttons – links (02-§71.2)', () => {
  it('HERO-BTN-02: contains links to schema.html, idag.html, lagg-till.html', () => {
    const html = renderIndexPage(buildPage());
    assert.ok(html.includes('href="schema.html"'), 'Expected link to schema.html');
    assert.ok(html.includes('href="idag.html"'), 'Expected link to idag.html');
    assert.ok(html.includes('href="lagg-till.html"'), 'Expected link to lagg-till.html');
    // Check labels
    const actionsBlock = html.slice(
      html.indexOf('class="hero-actions"'),
      html.indexOf('</div>', html.indexOf('class="hero-actions"')) + 6,
    );
    assert.ok(actionsBlock.includes('Schema'), 'Expected "Schema" label');
    assert.ok(actionsBlock.includes('Idag'), 'Expected "Idag" label');
    assert.ok(actionsBlock.includes('Lägg till'), 'Expected "Lägg till" label');
  });
});

// ── 02-§71.3 / 02-§71.7 — Pill-shaped terracotta styling ───────────────────

describe('hero action buttons – CSS (02-§71.3, 02-§71.7)', () => {
  it('HERO-BTN-03: .hero-actions-btn uses pill border-radius', () => {
    assert.ok(
      CSS.includes('.hero-actions-btn'),
      'Expected .hero-actions-btn rule in CSS',
    );
  });

  it('HERO-BTN-05: CSS uses terracotta background and 999px radius', () => {
    // Extract the .hero-actions-btn block
    const match = CSS.match(/\.hero-actions-btn\s*\{([^}]+)\}/);
    assert.ok(match, 'Expected .hero-actions-btn block');
    const block = match[1];
    assert.ok(
      block.includes('var(--color-terracotta)') || block.includes('#C76D48'),
      'Expected terracotta background',
    );
    assert.ok(block.includes('999px'), 'Expected pill border-radius (999px)');
  });
});

// ── 02-§71.4 — Data attributes for editing period ──────────────────────────

describe('hero action buttons – data attributes (02-§71.4)', () => {
  it('HERO-BTN-04: container has data-opens and data-closes attributes', () => {
    const html = renderIndexPage(buildPage({
      opensForEditing: '2026-06-14',
      editingCloses: '2026-06-22',
    }));
    assert.ok(
      html.includes('data-opens="2026-06-14"'),
      'Expected data-opens attribute',
    );
    assert.ok(
      html.includes('data-closes="2026-06-22"'),
      'Expected data-closes attribute',
    );
  });
});

// ── 02-§71.8 — Flex row centred with gap ────────────────────────────────────

describe('hero action buttons – layout (02-§71.8)', () => {
  it('HERO-BTN-06: .hero-actions uses flexbox with center and gap', () => {
    const match = CSS.match(/\.hero-actions\s*\{([^}]+)\}/);
    assert.ok(match, 'Expected .hero-actions block');
    const block = match[1];
    assert.ok(block.includes('display'), 'Expected display property');
    assert.ok(block.includes('flex'), 'Expected flex layout');
    assert.ok(
      block.includes('justify-content') && block.includes('center'),
      'Expected justify-content: center',
    );
    assert.ok(block.includes('gap'), 'Expected gap property');
  });
});

// ── 02-§71.6 — hidden attribute must override display: flex ─────────────────

describe('hero action buttons – hidden override (02-§71.6)', () => {
  it('HERO-BTN-08: CSS includes .hero-actions[hidden] { display: none }', () => {
    const match = CSS.match(/\.hero-actions\[hidden\]\s*\{([^}]+)\}/);
    assert.ok(match, 'Expected .hero-actions[hidden] rule in CSS');
    const block = match[1];
    assert.ok(
      /display\s*:\s*none/.test(block),
      'Expected display: none in .hero-actions[hidden]',
    );
  });
});

// ── No action buttons when opensForEditing is null ──────────────────────────

describe('hero action buttons – no editing period', () => {
  it('HERO-BTN-07: hero-actions is not rendered when opensForEditing is null', () => {
    const html = renderIndexPage(buildPage({
      opensForEditing: null,
      editingCloses: null,
    }));
    assert.ok(
      !html.includes('class="hero-actions"'),
      'Expected no hero-actions when editing dates are null',
    );
  });
});
