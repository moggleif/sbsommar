'use strict';

// Tests for consistent navigation and page title labels – 02-§75.1–75.11.
//
// §75.1 and §75.2 involve CSS visibility (desktop vs mobile) and cannot be
// unit-tested in Node.js.
// Manual checkpoint: open any page on desktop and confirm short uppercase
// labels; open on mobile and confirm long descriptive labels in hamburger.

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const { pageNav } = require('../source/build/layout');
const { renderSchedulePage } = require('../source/build/render');
const { renderIdagPage } = require('../source/build/render-idag');
const { renderIndexPage } = require('../source/build/render-index');

const CAMP = {
  name: 'SB Sommar 2026',
  start_date: '2026-06-28',
  end_date: '2026-07-05',
};

// ── §75.4 / §75.5 — Dual labels in pageNav ─────────────────────────────────

describe('pageNav – dual labels (02-§75.4, §75.5, §75.11)', () => {
  const html = pageNav('index.html', []);

  it('NL-01: desktop labels contain short text (02-§75.4)', () => {
    assert.ok(html.includes('nav-label-short'), 'Expected nav-label-short spans');
    const shorts = [...html.matchAll(/<span class="nav-label-short">([^<]+)<\/span>/g)]
      .map((m) => m[1]);
    assert.deepStrictEqual(shorts, ['Hem', 'Schema', 'Idag', 'Lägg till', 'Arkiv']);
  });

  it('NL-02: hamburger labels contain descriptive text (02-§75.5)', () => {
    assert.ok(html.includes('nav-label-long'), 'Expected nav-label-long spans');
    const longs = [...html.matchAll(/<span class="nav-label-long">([^<]+)<\/span>/g)]
      .map((m) => m[1]);
    assert.deepStrictEqual(longs, [
      'Hem',
      'Lägrets schema',
      'Dagens aktiviteter',
      'Lägg till aktivitet',
      'Lägerarkiv',
    ]);
  });

  it('NL-03: each nav link has both a short and a long label (02-§75.11)', () => {
    const links = [...html.matchAll(/<a [^>]*class="nav-link[^"]*"[^>]*>([\s\S]*?)<\/a>/g)];
    const pageLinks = links.filter((m) => !m[0].includes('nav-link--section'));
    assert.equal(pageLinks.length, 5, 'Expected 5 page links');
    for (const link of pageLinks) {
      const inner = link[1];
      assert.ok(inner.includes('nav-label-short'), `Missing short label in: ${inner}`);
      assert.ok(inner.includes('nav-label-long'), `Missing long label in: ${inner}`);
    }
  });
});

// ── §75.6 — Hero action buttons ─────────────────────────────────────────────

describe('renderIndexPage – hero action buttons (02-§75.6)', () => {
  const html = renderIndexPage({
    heroSrc: 'hero.jpg',
    heroAlt: 'Hero',
    sections: [],
    opensForEditing: '2026-06-20',
    editingCloses: '2026-07-06',
  }, '', []);

  it('NL-04: hero buttons are in order Idag, Schema, Lägg till (02-§75.6)', () => {
    const buttons = [...html.matchAll(/<a [^>]*class="hero-actions-btn"[^>]*>([^<]+)<\/a>/g)]
      .map((m) => m[1]);
    assert.deepStrictEqual(buttons, ['Idag', 'Schema', 'Lägg till']);
  });
});

// ── §75.7 / §75.9 — Schema page titles ─────────────────────────────────────

describe('renderSchedulePage – titles (02-§75.7, §75.9)', () => {
  const html = renderSchedulePage(CAMP, [], '', []);

  it('NL-05: h1 is "Lägrets schema – {campName}" (02-§75.7)', () => {
    assert.ok(
      html.includes('<h1>Lägrets schema – SB Sommar 2026</h1>'),
      `Expected h1 with camp name. Got snippet: ${html.match(/<h1>[^<]*<\/h1>/)?.[0]}`,
    );
  });

  it('NL-06: title element is "Lägrets schema – {campName}" (02-§75.9)', () => {
    assert.ok(
      html.includes('<title>Lägrets schema – SB Sommar 2026</title>'),
      `Expected title with camp name. Got snippet: ${html.match(/<title>[^<]*<\/title>/)?.[0]}`,
    );
  });
});

// ── §75.8 / §75.10 — Idag page titles ──────────────────────────────────────

describe('renderIdagPage – titles (02-§75.8, §75.10)', () => {
  const html = renderIdagPage(CAMP, [], '', []);

  it('NL-07: h1 is "Dagens aktiviteter" (02-§75.8)', () => {
    assert.ok(
      html.includes('>Dagens aktiviteter</h1>'),
      `Expected h1 "Dagens aktiviteter". Got snippet: ${html.match(/<h1[^>]*>[^<]*<\/h1>/)?.[0]}`,
    );
  });

  it('NL-08: title element is "Dagens aktiviteter – {campName}" (02-§75.10)', () => {
    assert.ok(
      html.includes('<title>Dagens aktiviteter – SB Sommar 2026</title>'),
      `Expected title with camp name. Got snippet: ${html.match(/<title>[^<]*<\/title>/)?.[0]}`,
    );
  });
});
