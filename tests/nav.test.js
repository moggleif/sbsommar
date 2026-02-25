'use strict';

// Tests for the shared navigation component – 02-§24.1–24.12.
//
// §24.10, §24.13, §24.14, §24.15 require a browser environment (CSS media
// queries, DOM events) and cannot be unit-tested in Node.js.
// Manual checkpoint: open any page on a ≤767 px viewport and confirm:
//   - Nav is collapsed by default (hamburger visible, links hidden).
//   - Pressing the button expands the menu.
//   - Pressing Escape closes the menu.
//   - Clicking outside the nav closes the menu.
//   - On ≥768 px viewport the hamburger is absent and all links are visible.

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const { pageNav } = require('../source/build/layout');
const { renderSchedulePage } = require('../source/build/render');
const { renderAddPage } = require('../source/build/render-add');
const { renderEditPage } = require('../source/build/render-edit');
const { renderIdagPage } = require('../source/build/render-idag');
const { renderIndexPage } = require('../source/build/render-index');
const { renderArkivPage } = require('../source/build/render-arkiv');

const SECTIONS = [
  { id: 'start',        navLabel: 'Om lägret' },
  { id: 'testimonials', navLabel: 'Röster' },
  { id: 'faq',          navLabel: 'FAQ' },
];

const CAMP = {
  name: 'SB Sommar 2026',
  start_date: '2026-06-28',
  end_date: '2026-07-05',
};
const EVENTS = [];
const LOCATIONS = ['Servicehus', 'Annat'];
const API_URL = 'https://api.example.com/add-event';

// ── pageNav – structure ───────────────────────────────────────────────────────

describe('pageNav – structure (02-§24.1, §24.2)', () => {
  it('NAV-01: renders a <nav class="page-nav"> element', () => {
    const html = pageNav('index.html', []);
    assert.ok(html.includes('<nav class="page-nav"'), `Got: ${html}`);
  });

  it('NAV-02: renders a hamburger toggle button inside the nav', () => {
    const html = pageNav('index.html', []);
    assert.ok(html.includes('<button type="button" class="nav-toggle"'), `Got: ${html}`);
  });

  it('NAV-10: hamburger button has an aria-label attribute (02-§24.11)', () => {
    const html = pageNav('index.html', []);
    assert.ok(html.includes('aria-label='), `Got: ${html}`);
  });

  it('NAV-11: hamburger button has aria-expanded attribute (02-§24.12)', () => {
    const html = pageNav('index.html', []);
    assert.ok(html.includes('aria-expanded='), `Got: ${html}`);
  });
});

// ── pageNav – page links ──────────────────────────────────────────────────────

describe('pageNav – page links (02-§24.4, §24.5, §24.6)', () => {
  it('NAV-04: renders Hem link', () => {
    const html = pageNav('schema.html', []);
    assert.ok(html.includes('href="index.html"'), `Got: ${html}`);
  });

  it('NAV-04b: renders Schema link', () => {
    const html = pageNav('index.html', []);
    assert.ok(html.includes('href="schema.html"'), `Got: ${html}`);
  });

  it('NAV-04c: renders Idag link on all pages including index', () => {
    const html = pageNav('index.html', []);
    assert.ok(html.includes('href="idag.html"'), `Got: ${html}`);
  });

  it('NAV-04d: renders Lägg till link', () => {
    const html = pageNav('index.html', []);
    assert.ok(html.includes('href="lagg-till.html"'), `Got: ${html}`);
  });

  it('NAV-04e: renders Arkiv link', () => {
    const html = pageNav('index.html', []);
    assert.ok(html.includes('href="arkiv.html"'), `Got: ${html}`);
  });

  it('NAV-05: active page link has class "active" (02-§24.5)', () => {
    const html = pageNav('schema.html', []);
    assert.ok(
      html.includes('href="schema.html"') && html.includes('active'),
      `Expected active class on schema link. Got: ${html}`,
    );
    // The active class must be on the schema link, not on index
    const schemaMatch = html.match(/href="schema\.html"[^>]*class="[^"]*active/);
    const classBeforeHref = html.match(/class="[^"]*active[^"]*"[^>]*href="schema\.html"/);
    assert.ok(
      schemaMatch || classBeforeHref,
      `Expected schema.html link to carry active class. Got: ${html}`,
    );
  });

  it('NAV-06: non-current pages do not carry active class', () => {
    const html = pageNav('schema.html', []);
    // index.html link must NOT have active
    const indexLink = html.match(/href="index\.html"[^<]*/)?.[0] || '';
    assert.ok(!indexLink.includes('active'), `index link should not be active: ${indexLink}`);
  });
});

// ── pageNav – section links ───────────────────────────────────────────────────

describe('pageNav – section links (02-§24.7, §24.8, §24.9)', () => {
  it('NAV-07: renders section links when navSections is provided', () => {
    const html = pageNav('schema.html', SECTIONS);
    assert.ok(html.includes('Om lägret'), `Got: ${html}`);
    assert.ok(html.includes('Röster'), `Got: ${html}`);
    assert.ok(html.includes('FAQ'), `Got: ${html}`);
  });

  it('NAV-08: section links use navLabel from the sections array', () => {
    const html = pageNav('index.html', [{ id: 'mat', navLabel: 'Mat' }]);
    assert.ok(html.includes('Mat'), `Got: ${html}`);
  });

  it('NAV-09: section links on non-index pages point to index.html#id', () => {
    const html = pageNav('schema.html', SECTIONS);
    assert.ok(html.includes('href="index.html#start"'), `Got: ${html}`);
    assert.ok(html.includes('href="index.html#testimonials"'), `Got: ${html}`);
  });

  it('NAV-09b: section links on index page use anchor-only hrefs', () => {
    const html = pageNav('index.html', SECTIONS);
    assert.ok(html.includes('href="#start"'), `Expected anchor-only on index. Got: ${html}`);
    assert.ok(html.includes('href="#testimonials"'), `Got: ${html}`);
  });

  it('renders no section links when navSections is empty', () => {
    const html = pageNav('schema.html', []);
    assert.ok(!html.includes('nav-link--section'), `Got: ${html}`);
  });
});

// ── render functions include nav (02-§24.1) ───────────────────────────────────

describe('render functions – nav present (02-§24.1)', () => {
  it('NAV-01a: renderSchedulePage includes page-nav', () => {
    const html = renderSchedulePage(CAMP, EVENTS, '', SECTIONS);
    assert.ok(html.includes('class="page-nav"'), 'Expected page-nav in schema page');
  });

  it('NAV-01b: renderAddPage includes page-nav', () => {
    const html = renderAddPage(CAMP, LOCATIONS, API_URL, '', SECTIONS);
    assert.ok(html.includes('class="page-nav"'), 'Expected page-nav in lagg-till page');
  });

  it('NAV-01c: renderEditPage includes page-nav', () => {
    const html = renderEditPage(CAMP, LOCATIONS, API_URL, '', SECTIONS);
    assert.ok(html.includes('class="page-nav"'), 'Expected page-nav in redigera page');
  });

  it('NAV-01d: renderIdagPage includes page-nav', () => {
    const html = renderIdagPage(CAMP, EVENTS, '', SECTIONS);
    assert.ok(html.includes('class="page-nav"'), 'Expected page-nav in idag page');
  });

  it('NAV-01e: renderIndexPage includes page-nav', () => {
    const html = renderIndexPage({ heroSrc: null, heroAlt: null, sections: [] }, '', SECTIONS);
    assert.ok(html.includes('class="page-nav"'), 'Expected page-nav in index page');
  });

  it('NAV-01f: renderArkivPage includes page-nav', () => {
    const html = renderArkivPage([], '', SECTIONS);
    assert.ok(html.includes('class="page-nav"'), 'Expected page-nav in arkiv page');
  });
});

// ── index page – no section-nav (02-§24.3) ────────────────────────────────────

describe('renderIndexPage – no section-nav (02-§24.3)', () => {
  it('NAV-03: index page does not contain a <nav class="section-nav"> element', () => {
    const html = renderIndexPage({ heroSrc: null, heroAlt: null, sections: [] }, '', SECTIONS);
    assert.ok(
      !html.includes('class="section-nav"'),
      `Expected no section-nav in index page. Got snippet: ${html.slice(0, 500)}`,
    );
  });
});
