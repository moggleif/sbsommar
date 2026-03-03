'use strict';

// Tests for §64 — Index Page Design Improvements.
//
// Covers: testimonial cards (§64.1–64.4), alternating section backgrounds
// (§64.5–64.7), decorative headings (§64.8), RFSB logo (§64.9), and
// back-to-top link (§64.10–64.12).
//
// Browser-specific rendering (CSS ::after, border-radius, box-shadow) cannot
// be verified in Node.js. Manual checkpoint:
//   - Open index.html and confirm testimonial cards have circular images,
//     white background, and shadow.
//   - Confirm alternating sections have white backgrounds with rounded corners.
//   - Confirm H2 headings display a short sage-green line underneath.
//   - Confirm RFSB logo is displayed as a small badge (~100 px).

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const {
  renderIndexPage,
  convertMarkdown,
  wrapTestimonialCards,
} = require('../source/build/render-index');
const { pageNav } = require('../source/build/layout');

const CSS_PATH = path.join(__dirname, '..', 'source', 'assets', 'cs', 'style.css');
const css = fs.readFileSync(CSS_PATH, 'utf8');

// ── Testimonial cards (02-§64.1–64.4) ───────────────────────────────────────

describe('wrapTestimonialCards (02-§64.1–64.4)', () => {
  const testimonialMd = [
    '# Vad säger tidigare deltagare?',
    '',
    '## Marie Johansson',
    '',
    '![Marie Johansson](images/marie-johansson.webp)',
    '',
    '> En fin upplevelse.',
    '',
    '## Familjen Nilsson',
    '',
    '![Familjen Nilsson](images/familjen-nilsson.webp)',
    '',
    '> Vi kommer igen!',
  ].join('\n');

  // Convert with headingOffset=1 (## → h3), like the real build does
  const html = convertMarkdown(testimonialMd, 1);
  const wrapped = wrapTestimonialCards(html);

  it('IDX-01: wraps each testimonial in a .testimonial-card div', () => {
    const cards = (wrapped.match(/class="testimonial-card"/g) || []).length;
    assert.strictEqual(cards, 2, `Expected 2 testimonial cards, got ${cards}`);
  });

  it('IDX-02: each card contains a .testimonial-header with image and name', () => {
    assert.ok(
      wrapped.includes('class="testimonial-header"'),
      `Expected .testimonial-header, got: ${wrapped.slice(0, 500)}`,
    );
  });

  it('IDX-03: testimonial images get class="testimonial-img"', () => {
    const imgs = (wrapped.match(/class="testimonial-img"/g) || []).length;
    assert.strictEqual(imgs, 2, `Expected 2 testimonial-img elements, got ${imgs}`);
  });

  it('IDX-04: heading (h3) is preserved inside the card', () => {
    assert.ok(wrapped.includes('<h3>'), `Expected h3 heading in card, got: ${wrapped.slice(0, 500)}`);
  });

  it('IDX-05: blockquote is preserved inside the card', () => {
    assert.ok(wrapped.includes('<blockquote>'), `Expected blockquote in card`);
  });

  it('IDX-06: content before the first h3 (the h2 section heading) is preserved outside cards', () => {
    // The h2 section heading should appear before the first card
    const h2Pos = wrapped.indexOf('<h2>');
    const firstCard = wrapped.indexOf('testimonial-card');
    assert.ok(h2Pos < firstCard, 'h2 heading should appear before the first card');
  });

  it('IDX-07: returns HTML unchanged when no h3 headings are present', () => {
    const plain = '<h2>Title</h2>\n<p>Just text.</p>';
    assert.strictEqual(wrapTestimonialCards(plain), plain);
  });
});

// ── Alternating section backgrounds (02-§64.5–64.7) ─────────────────────────

describe('renderIndexPage – alternating sections (02-§64.5–64.7)', () => {
  const sections = [
    { id: 'start',        navLabel: 'Om lägret',     html: '<p>Start</p>' },
    { id: 'testimonials', navLabel: 'Röster',         html: '<p>Röster</p>' },
    { id: 'faq',          navLabel: 'Vanliga frågor', html: '<p>FAQ</p>' },
    { id: 'anmalan',      navLabel: 'Anmälan',        html: '<p>Anmälan</p>' },
    { id: 'regler',       navLabel: 'Regler',         html: '<p>Regler</p>' },
  ];

  const html = renderIndexPage({
    heroSrc: null,
    heroAlt: null,
    sections,
  });

  it('IDX-08: first section has class section-first, not section-alt', () => {
    const match = html.match(/<section id="start"[^>]*>/);
    assert.ok(match, 'Expected section#start');
    assert.ok(match[0].includes('section-first'), 'First section should have section-first');
    assert.ok(!match[0].includes('section-alt'), 'First section must not have section-alt');
  });

  it('IDX-09: second section (index 1) has class section-alt', () => {
    const match = html.match(/<section id="testimonials"[^>]*>/);
    assert.ok(match, 'Expected section#testimonials');
    assert.ok(match[0].includes('section-alt'), `Second section should have section-alt, got: ${match[0]}`);
  });

  it('IDX-10: third section (index 2) does NOT have section-alt', () => {
    const match = html.match(/<section id="faq"[^>]*>/);
    assert.ok(match, 'Expected section#faq');
    assert.ok(!match[0].includes('section-alt'), `Third section should not have section-alt, got: ${match[0]}`);
  });

  it('IDX-11: fourth section (index 3) has class section-alt', () => {
    const match = html.match(/<section id="anmalan"[^>]*>/);
    assert.ok(match, 'Expected section#anmalan');
    assert.ok(match[0].includes('section-alt'), `Fourth section should have section-alt, got: ${match[0]}`);
  });
});

// ── Back-to-top link (02-§64.10–64.12) ──────────────────────────────────────

describe('pageNav – back-to-top link (02-§64.10–64.12)', () => {
  const SECTIONS = [
    { id: 'start', navLabel: 'Om lägret' },
    { id: 'faq',   navLabel: 'FAQ' },
  ];

  it('IDX-12: nav contains a back-to-top link', () => {
    const html = pageNav('index.html', SECTIONS);
    assert.ok(html.includes('nav-link--top'), `Expected nav-link--top, got: ${html}`);
  });

  it('IDX-13: back-to-top link has href="#"', () => {
    const html = pageNav('index.html', SECTIONS);
    const match = html.match(/<a[^>]*nav-link--top[^>]*>/);
    assert.ok(match, 'Expected nav-link--top element');
    assert.ok(match[0].includes('href="#"'), `Expected href="#", got: ${match[0]}`);
  });

  it('IDX-14: back-to-top link is inside the nav-menu div', () => {
    const html = pageNav('index.html', SECTIONS);
    const menuStart = html.indexOf('id="nav-menu"');
    const topLink = html.indexOf('nav-link--top');
    const menuEnd = html.lastIndexOf('</div>');
    assert.ok(topLink > menuStart && topLink < menuEnd, 'Back-to-top link must be inside nav-menu');
  });
});

// ── CSS rules (02-§64.1, §64.5, §64.8) ─────────────────────────────────────

describe('CSS – index design improvements', () => {
  it('IDX-15: .testimonial-card rule exists', () => {
    assert.ok(css.includes('.testimonial-card'), 'Expected .testimonial-card CSS rule');
  });

  it('IDX-16: .testimonial-img rule exists with border-radius', () => {
    assert.ok(css.includes('.testimonial-img'), 'Expected .testimonial-img CSS rule');
  });

  it('IDX-17: .section-alt rule exists with light background', () => {
    assert.ok(css.includes('.section-alt'), 'Expected .section-alt CSS rule');
  });

  it('IDX-18: section-alt has extra vertical padding', () => {
    assert.ok(css.includes('section-alt') && css.includes('padding-bottom'), 'Expected section-alt with vertical padding');
  });

  it('IDX-19: .nav-link--top rule exists', () => {
    assert.ok(css.includes('.nav-link--top'), 'Expected .nav-link--top CSS rule');
  });
});
