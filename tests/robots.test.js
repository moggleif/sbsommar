'use strict';

// Tests for search engine and crawler blocking — 02-§1a.1, §1a.2, §1a.3.
//
// These verify:
//   - Every render function includes <meta name="robots" content="noindex, nofollow"> (ROB-01..07)
//   - No page includes discoverability metadata (sitemap, og: tags, etc.) (ROB-08..14)
//
// 02-§1a.1 (robots.txt generation) is a build step that writes a static file.
// It cannot be verified via render-function unit tests. Marked as manual:
//   "Run `npm run build` and verify public/robots.txt contains
//    User-agent: * and Disallow: /"

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const { renderSchedulePage } = require('../source/build/render');
const { renderTodayPage } = require('../source/build/render-today');
const { renderIdagPage } = require('../source/build/render-idag');
const { renderAddPage } = require('../source/build/render-add');
const { renderEditPage } = require('../source/build/render-edit');
const { renderArkivPage } = require('../source/build/render-arkiv');
const { renderIndexPage } = require('../source/build/render-index');

// ── Shared fixtures ──────────────────────────────────────────────────────────

const CAMP = {
  name: 'SB Sommar 2026',
  start_date: '2026-06-28',
  end_date: '2026-07-05',
};

const EVENTS = [];
const LOCATIONS = ['Servicehus', 'Annat'];
const API_URL = 'https://api.example.com/add-event';
const QR_SVG = '<svg></svg>';
const FOOTER_HTML = '';

const META_ROBOTS = '<meta name="robots" content="noindex, nofollow">';

// ── 02-§1a.2: Every page includes meta robots noindex, nofollow ─────────────

describe('meta robots noindex (02-§1a.2)', () => {
  it('ROB-01: renderSchedulePage includes meta robots noindex', () => {
    const html = renderSchedulePage(CAMP, EVENTS, FOOTER_HTML);
    assert.ok(html.includes(META_ROBOTS), 'Expected meta robots noindex in schema.html');
  });

  it('ROB-02: renderTodayPage includes meta robots noindex', () => {
    const html = renderTodayPage(CAMP, EVENTS, QR_SVG, FOOTER_HTML);
    assert.ok(html.includes(META_ROBOTS), 'Expected meta robots noindex in dagens-schema.html');
  });

  it('ROB-03: renderIdagPage includes meta robots noindex', () => {
    const html = renderIdagPage(CAMP, EVENTS, FOOTER_HTML);
    assert.ok(html.includes(META_ROBOTS), 'Expected meta robots noindex in idag.html');
  });

  it('ROB-04: renderAddPage includes meta robots noindex', () => {
    const html = renderAddPage(CAMP, LOCATIONS, API_URL, FOOTER_HTML);
    assert.ok(html.includes(META_ROBOTS), 'Expected meta robots noindex in lagg-till.html');
  });

  it('ROB-05: renderEditPage includes meta robots noindex', () => {
    const html = renderEditPage(CAMP, LOCATIONS, API_URL, FOOTER_HTML);
    assert.ok(html.includes(META_ROBOTS), 'Expected meta robots noindex in redigera.html');
  });

  it('ROB-06: renderArkivPage includes meta robots noindex', () => {
    const html = renderArkivPage([], FOOTER_HTML);
    assert.ok(html.includes(META_ROBOTS), 'Expected meta robots noindex in arkiv.html');
  });

  it('ROB-07: renderIndexPage includes meta robots noindex', () => {
    const html = renderIndexPage({ heroSrc: null, heroAlt: null, sections: [] }, FOOTER_HTML);
    assert.ok(html.includes(META_ROBOTS), 'Expected meta robots noindex in index.html');
  });
});

// ── 02-§1a.3: No discoverability metadata ───────────────────────────────────

describe('no discoverability metadata (02-§1a.3)', () => {
  /** Patterns that must NOT appear in any page output. */
  const FORBIDDEN = [
    { pattern: 'og:', label: 'Open Graph meta tag' },
    { pattern: 'twitter:', label: 'Twitter Card meta tag' },
    { pattern: 'sitemap', label: 'sitemap reference' },
  ];

  function assertNoDiscoverability(html, pageName) {
    for (const { pattern, label } of FORBIDDEN) {
      assert.ok(
        !html.toLowerCase().includes(pattern),
        `${pageName} must not contain ${label} ("${pattern}")`,
      );
    }
  }

  it('ROB-08: renderSchedulePage has no discoverability metadata', () => {
    assertNoDiscoverability(renderSchedulePage(CAMP, EVENTS, FOOTER_HTML), 'schema.html');
  });

  it('ROB-09: renderTodayPage has no discoverability metadata', () => {
    assertNoDiscoverability(renderTodayPage(CAMP, EVENTS, QR_SVG, FOOTER_HTML), 'dagens-schema.html');
  });

  it('ROB-10: renderIdagPage has no discoverability metadata', () => {
    assertNoDiscoverability(renderIdagPage(CAMP, EVENTS, FOOTER_HTML), 'idag.html');
  });

  it('ROB-11: renderAddPage has no discoverability metadata', () => {
    assertNoDiscoverability(renderAddPage(CAMP, LOCATIONS, API_URL, FOOTER_HTML), 'lagg-till.html');
  });

  it('ROB-12: renderEditPage has no discoverability metadata', () => {
    assertNoDiscoverability(renderEditPage(CAMP, LOCATIONS, API_URL, FOOTER_HTML), 'redigera.html');
  });

  it('ROB-13: renderArkivPage has no discoverability metadata', () => {
    assertNoDiscoverability(renderArkivPage([], FOOTER_HTML), 'arkiv.html');
  });

  it('ROB-14: renderIndexPage has no discoverability metadata', () => {
    assertNoDiscoverability(
      renderIndexPage({ heroSrc: null, heroAlt: null, sections: [] }, FOOTER_HTML),
      'index.html',
    );
  });
});
