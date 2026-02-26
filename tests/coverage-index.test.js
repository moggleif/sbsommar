'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const {
  renderIndexPage,
  convertMarkdown,
  renderUpcomingCampsHtml,
} = require('../source/build/render-index');

// ── Shared fixtures ─────────────────────────────────────────────────────────

const basePage = {
  heroSrc: 'images/hero.jpg',
  heroAlt: 'Camp view',
  discordUrl: null,
  facebookUrl: null,
  countdownTarget: null,
  sections: [
    { id: 'start', navLabel: 'Om lägret', html: '<h2>Om lägret</h2><p>Intro text</p>' },
    { id: 'program', navLabel: 'Program', html: '<h2>Programmet</h2><p>Details</p>' },
  ],
};

// ── 02-§2.1  Homepage exists and is served at / ─────────────────────────────
// Verifies that renderIndexPage produces a complete, valid HTML page.

describe('02-§2.1 — Homepage rendered as full HTML page', () => {
  it('COV-01: produces a <!DOCTYPE html> page', () => {
    const html = renderIndexPage(basePage);
    assert.ok(html.startsWith('<!DOCTYPE html>'), 'Should start with DOCTYPE');
  });

  it('COV-02: sets lang="sv" on <html>', () => {
    const html = renderIndexPage(basePage);
    assert.ok(html.includes('<html lang="sv">'), 'Should have Swedish lang');
  });

  it('COV-03: has <title>SB Sommar</title>', () => {
    const html = renderIndexPage(basePage);
    assert.ok(html.includes('<title>SB Sommar</title>'), 'Should have SB Sommar title');
  });

  it('COV-04: includes nav and content sections', () => {
    const html = renderIndexPage(basePage);
    assert.ok(html.includes('class="page-nav"'), 'Should include page-nav');
    assert.ok(html.includes('class="content"'), 'Should include content div');
  });

  it('COV-05: renders all provided sections', () => {
    const html = renderIndexPage(basePage);
    assert.ok(html.includes('id="start"'), 'Should have start section');
    assert.ok(html.includes('id="program"'), 'Should have program section');
  });
});

// ── 02-§3.1  Homepage answers pre-camp questions ────────────────────────────
// Verifies that the homepage renders modular content sections.

describe('02-§3.1 — Homepage built from modular sections', () => {
  it('COV-06: each section is wrapped in a <section> element with its id', () => {
    const html = renderIndexPage(basePage);
    assert.ok(html.includes('<section id="start"'), 'start section wrapped');
    assert.ok(html.includes('<section id="program"'), 'program section wrapped');
  });

  it('COV-07: section HTML content is included verbatim', () => {
    const html = renderIndexPage(basePage);
    assert.ok(html.includes('Om lägret'), 'start section content present');
    assert.ok(html.includes('Programmet'), 'program section content present');
  });
});

// ── CL-§3.1  Main page built from modular sections ─────────────────────────

describe('CL-§3.1 — Modular sections independently renderable', () => {
  it('COV-08: single section renders without error', () => {
    const page = {
      ...basePage,
      sections: [{ id: 'only', navLabel: 'Only', html: '<p>Only section</p>' }],
    };
    const html = renderIndexPage(page);
    assert.ok(html.includes('<section id="only"'), 'single section rendered');
    assert.ok(html.includes('Only section'), 'section content rendered');
  });

  it('COV-09: empty sections array renders without error', () => {
    const page = { ...basePage, sections: [] };
    const html = renderIndexPage(page);
    assert.ok(html.includes('<!DOCTYPE html>'), 'valid HTML produced');
  });
});

// ── CL-§3.3  Sections reorderable without modifying layout ──────────────────

describe('CL-§3.3 — Section order driven by input array', () => {
  it('COV-10: sections appear in the order provided', () => {
    const page = {
      ...basePage,
      sections: [
        { id: 'b', navLabel: 'B', html: '<p>BB</p>' },
        { id: 'a', navLabel: 'A', html: '<p>AA</p>' },
      ],
    };
    const html = renderIndexPage(page);
    const posB = html.indexOf('id="b"');
    const posA = html.indexOf('id="a"');
    assert.ok(posB < posA, 'b should appear before a');
  });

  it('COV-11: reversed order changes output order', () => {
    const page = {
      ...basePage,
      sections: [
        { id: 'a', navLabel: 'A', html: '<p>AA</p>' },
        { id: 'b', navLabel: 'B', html: '<p>BB</p>' },
      ],
    };
    const html = renderIndexPage(page);
    const posA = html.indexOf('id="a"');
    const posB = html.indexOf('id="b"');
    assert.ok(posA < posB, 'a should appear before b');
  });
});

// ── 02-§3.3  Homepage remains complete when no camp active ──────────────────
// This is about the build.js fallback, but we can verify the page renders
// correctly even with minimal data.

describe('02-§3.3 — Page renders with minimal camp data', () => {
  it('COV-12: page renders with no hero image', () => {
    const page = { ...basePage, heroSrc: null, heroAlt: null };
    const html = renderIndexPage(page);
    assert.ok(html.includes('<!DOCTYPE html>'), 'valid HTML');
    assert.ok(!html.includes('class="hero"'), 'no hero section rendered');
  });

  it('COV-13: page renders with no sidebar links', () => {
    const page = { ...basePage, discordUrl: null, facebookUrl: null, countdownTarget: null };
    const html = renderIndexPage(page);
    assert.ok(!html.includes('class="hero-sidebar"'), 'no sidebar rendered');
  });
});

// ── 02-§14.1  All text in Swedish ───────────────────────────────────────────
// Verifies key Swedish labels appear in the index page output.

describe('02-§14.1 — Index page uses Swedish text', () => {
  it('COV-14: page title is in Swedish', () => {
    const html = renderIndexPage(basePage);
    assert.ok(html.includes('<title>SB Sommar</title>'), 'Swedish title');
  });

  it('COV-15: hero heading is in Swedish', () => {
    const html = renderIndexPage(basePage);
    assert.ok(html.includes('Sommarläger i Sysslebäck'), 'Swedish hero heading');
  });
});

// ── 02-§2.9  No login required ──────────────────────────────────────────────
// Verifies no authentication-related HTML exists.

describe('02-§2.9 — No authentication in pages', () => {
  it('COV-16: index page has no login form or auth references', () => {
    const html = renderIndexPage(basePage);
    assert.ok(!html.includes('login'), 'no login reference');
    assert.ok(!html.includes('password'), 'no password reference');
    assert.ok(!html.includes('authenticate'), 'no authenticate reference');
  });
});
