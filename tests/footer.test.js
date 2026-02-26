'use strict';

// Tests for the shared site footer — 02-§22.1–22.6.
//
// These verify:
//   - pageFooter() returns the correct wrapper element (FTR-01..03)
//   - Every render function includes the footer when footerHtml is provided (FTR-04..16)
//   - Every render function handles an empty footerHtml without crashing (FTR-05, 07, 09, 11, 13, 15, 17)
//
// 02-§22.2 and 02-§22.6 are documented rather than unit-tested:
//   - §22.2: footer.md is the single source of truth — enforced by convention and
//     the absence of hardcoded footer text in any render function (code review).
//   - §22.6: follows from §22.3 — passing different footerHtml produces different
//     footer output.

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const { pageFooter } = require('../source/build/layout');
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
const FOOTER_HTML = '<p>Epost: info@sbsommar.se</p>';

// ── pageFooter ───────────────────────────────────────────────────────────────

describe('pageFooter', () => {
  it('FTR-01 (02-§22.5): returns empty string when footerHtml is empty', () => {
    assert.strictEqual(pageFooter(''), '');
  });

  it('FTR-02 (02-§22.1): returns a <footer class="site-footer"> element', () => {
    const result = pageFooter(FOOTER_HTML);
    assert.ok(
      result.includes('<footer class="site-footer">'),
      'Expected <footer class="site-footer">',
    );
  });

  it('FTR-03 (02-§22.3): wraps the provided HTML inside the footer element', () => {
    const result = pageFooter(FOOTER_HTML);
    assert.ok(result.includes(FOOTER_HTML), 'Expected footer content inside the element');
    assert.ok(result.includes('</footer>'), 'Expected closing </footer> tag');
  });
});

// ── renderSchedulePage ───────────────────────────────────────────────────────

describe('renderSchedulePage – site footer (02-§22.1, §22.3, §22.5)', () => {
  it('FTR-04: includes <footer class="site-footer"> when footerHtml is provided', () => {
    const html = renderSchedulePage(CAMP, EVENTS, FOOTER_HTML);
    assert.ok(
      html.includes('<footer class="site-footer">'),
      'Expected <footer class="site-footer"> in schema.html output',
    );
    assert.ok(html.includes(FOOTER_HTML), 'Expected footer content in schema.html output');
  });

  it('FTR-05: renders without crashing and omits site-footer when footerHtml is empty', () => {
    const html = renderSchedulePage(CAMP, EVENTS, '');
    assert.ok(html.includes('<!DOCTYPE html>'), 'Expected valid HTML document');
    assert.ok(!html.includes('site-footer'), 'Expected no site-footer when footerHtml is empty');
  });
});

// ── renderTodayPage ──────────────────────────────────────────────────────────

describe('renderTodayPage – no site footer (02-§4.14)', () => {
  it('FTR-06: display page never includes site-footer (footer removed per 02-§4.14)', () => {
    // renderTodayPage no longer accepts footerHtml; site footer is intentionally absent.
    const html = renderTodayPage(CAMP, EVENTS, QR_SVG);
    assert.ok(html.includes('<!DOCTYPE html>'), 'Expected valid HTML document');
    assert.ok(!html.includes('site-footer'), 'Expected no site-footer in display mode');
  });

  it('FTR-07: display page renders correctly without any footer argument', () => {
    const html = renderTodayPage(CAMP, EVENTS, QR_SVG);
    assert.ok(html.includes('class="display-mode"'), 'Expected display-mode body class');
    assert.ok(!html.includes('site-footer'), 'Expected no site-footer in display mode');
  });
});

// ── renderIdagPage ───────────────────────────────────────────────────────────

describe('renderIdagPage – site footer (02-§22.1, §22.3, §22.5)', () => {
  it('FTR-08: includes <footer class="site-footer"> when footerHtml is provided', () => {
    const html = renderIdagPage(CAMP, EVENTS, FOOTER_HTML);
    assert.ok(
      html.includes('<footer class="site-footer">'),
      'Expected <footer class="site-footer"> in idag.html output',
    );
    assert.ok(html.includes(FOOTER_HTML), 'Expected footer content in idag.html output');
  });

  it('FTR-09: renders without crashing and omits site-footer when footerHtml is empty', () => {
    const html = renderIdagPage(CAMP, EVENTS, '');
    assert.ok(html.includes('<!DOCTYPE html>'), 'Expected valid HTML document');
    assert.ok(!html.includes('site-footer'), 'Expected no site-footer when footerHtml is empty');
  });
});

// ── renderAddPage ────────────────────────────────────────────────────────────

describe('renderAddPage – site footer (02-§22.1, §22.3, §22.5)', () => {
  it('FTR-10: includes <footer class="site-footer"> when footerHtml is provided', () => {
    const html = renderAddPage(CAMP, LOCATIONS, API_URL, FOOTER_HTML);
    assert.ok(
      html.includes('<footer class="site-footer">'),
      'Expected <footer class="site-footer"> in lagg-till.html output',
    );
    assert.ok(html.includes(FOOTER_HTML), 'Expected footer content in lagg-till.html output');
  });

  it('FTR-11: renders without crashing and omits site-footer when footerHtml is empty', () => {
    const html = renderAddPage(CAMP, LOCATIONS, API_URL, '');
    assert.ok(html.includes('<!DOCTYPE html>'), 'Expected valid HTML document');
    assert.ok(!html.includes('site-footer'), 'Expected no site-footer when footerHtml is empty');
  });
});

// ── renderEditPage ───────────────────────────────────────────────────────────

describe('renderEditPage – site footer (02-§22.1, §22.3, §22.5)', () => {
  it('FTR-12: includes <footer class="site-footer"> when footerHtml is provided', () => {
    const html = renderEditPage(CAMP, LOCATIONS, API_URL, FOOTER_HTML);
    assert.ok(
      html.includes('<footer class="site-footer">'),
      'Expected <footer class="site-footer"> in redigera.html output',
    );
    assert.ok(html.includes(FOOTER_HTML), 'Expected footer content in redigera.html output');
  });

  it('FTR-13: renders without crashing and omits site-footer when footerHtml is empty', () => {
    const html = renderEditPage(CAMP, LOCATIONS, API_URL, '');
    assert.ok(html.includes('<!DOCTYPE html>'), 'Expected valid HTML document');
    assert.ok(!html.includes('site-footer'), 'Expected no site-footer when footerHtml is empty');
  });
});

// ── renderArkivPage ──────────────────────────────────────────────────────────

describe('renderArkivPage – site footer (02-§22.1, §22.3, §22.5)', () => {
  it('FTR-14: includes <footer class="site-footer"> when footerHtml is provided', () => {
    const html = renderArkivPage([], FOOTER_HTML);
    assert.ok(
      html.includes('<footer class="site-footer">'),
      'Expected <footer class="site-footer"> in arkiv.html output',
    );
    assert.ok(html.includes(FOOTER_HTML), 'Expected footer content in arkiv.html output');
  });

  it('FTR-15: renders without crashing and omits site-footer when footerHtml is empty', () => {
    const html = renderArkivPage([], '');
    assert.ok(html.includes('<!DOCTYPE html>'), 'Expected valid HTML document');
    assert.ok(!html.includes('site-footer'), 'Expected no site-footer when footerHtml is empty');
  });
});

// ── renderIndexPage ──────────────────────────────────────────────────────────

describe('renderIndexPage – site footer (02-§22.1, §22.3, §22.5)', () => {
  it('FTR-16: includes <footer class="site-footer"> when footerHtml is provided', () => {
    const html = renderIndexPage({ heroSrc: null, heroAlt: null, sections: [] }, FOOTER_HTML);
    assert.ok(
      html.includes('<footer class="site-footer">'),
      'Expected <footer class="site-footer"> in index.html output',
    );
    assert.ok(html.includes(FOOTER_HTML), 'Expected footer content in index.html output');
  });

  it('FTR-17: renders without crashing and omits site-footer when footerHtml is empty', () => {
    const html = renderIndexPage({ heroSrc: null, heroAlt: null, sections: [] }, '');
    assert.ok(html.includes('<!DOCTYPE html>'), 'Expected valid HTML document');
    assert.ok(!html.includes('site-footer'), 'Expected no site-footer when footerHtml is empty');
  });
});
