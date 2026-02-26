'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const { pageNav } = require('../source/build/layout');
const { renderSchedulePage } = require('../source/build/render');
const { renderAddPage } = require('../source/build/render-add');
const { renderEditPage } = require('../source/build/render-edit');
const { renderIdagPage } = require('../source/build/render-idag');

// ── Shared fixtures ─────────────────────────────────────────────────────────

const CAMP = {
  name: 'Test Camp',
  location: 'Sysslebäck',
  start_date: '2099-07-01',
  end_date: '2099-07-07',
  opens_for_editing: '2099-06-01',
};

const EVENTS = [
  { id: 'e1', title: 'Frukost', date: '2099-07-01', start: '08:00', end: '09:00', location: 'Servicehus', responsible: 'Anna' },
];

const LOCATIONS = ['Servicehus', 'Strand', 'Annat'];

const SECTIONS = [
  { id: 'start', navLabel: 'Om lägret' },
  { id: 'faq', navLabel: 'FAQ' },
];

// ── CL-§2.4  Layout components reused across pages ──────────────────────────

describe('CL-§2.4 — Shared layout components reused across pages', () => {
  it('LAY-01: pageNav produces a <nav class="page-nav">', () => {
    const nav = pageNav('index.html');
    assert.ok(nav.includes('<nav class="page-nav"'), 'has page-nav class');
  });

  it('LAY-02: pageNav includes all five page links', () => {
    const nav = pageNav('schema.html');
    assert.ok(nav.includes('Hem'), 'has Hem');
    assert.ok(nav.includes('Schema'), 'has Schema');
    assert.ok(nav.includes('Idag'), 'has Idag');
    assert.ok(nav.includes('Lägg till aktivitet'), 'has Lägg till');
    assert.ok(nav.includes('Arkiv'), 'has Arkiv');
  });

  it('LAY-03: schedule page uses shared pageNav', () => {
    const html = renderSchedulePage(CAMP, EVENTS);
    assert.ok(html.includes('class="page-nav"'), 'schedule has page-nav');
  });

  it('LAY-04: add-activity page uses shared pageNav', () => {
    const html = renderAddPage(CAMP, LOCATIONS, '/add-event');
    assert.ok(html.includes('class="page-nav"'), 'add page has page-nav');
  });

  it('LAY-05: edit page uses shared pageNav', () => {
    const html = renderEditPage(CAMP, LOCATIONS, '/edit-event');
    assert.ok(html.includes('class="page-nav"'), 'edit page has page-nav');
  });

  it('LAY-06: idag page uses shared pageNav', () => {
    const html = renderIdagPage(CAMP, EVENTS);
    assert.ok(html.includes('class="page-nav"'), 'idag page has page-nav');
  });
});

// ── CL-§2.5  No duplicated markup ──────────────────────────────────────────

describe('CL-§2.5 — No duplicated navigation markup', () => {
  it('LAY-07: all pages produce identical nav structure', () => {
    const schemaNav = renderSchedulePage(CAMP, EVENTS).match(/<nav[^]*?<\/nav>/)[0];
    const addNav = renderAddPage(CAMP, LOCATIONS, '/add-event').match(/<nav[^]*?<\/nav>/)[0];
    const editNav = renderEditPage(CAMP, LOCATIONS, '/edit-event').match(/<nav[^]*?<\/nav>/)[0];
    const idagNav = renderIdagPage(CAMP, EVENTS).match(/<nav[^]*?<\/nav>/)[0];

    // All should have the same page links (just different active states)
    for (const nav of [schemaNav, addNav, editNav, idagNav]) {
      assert.ok(nav.includes('Hem'), 'all navs have Hem');
      assert.ok(nav.includes('Schema'), 'all navs have Schema');
      assert.ok(nav.includes('Idag'), 'all navs have Idag');
      assert.ok(nav.includes('Lägg till aktivitet'), 'all navs have Lägg till');
      assert.ok(nav.includes('Arkiv'), 'all navs have Arkiv');
    }
  });
});

// ── CL-§3.4  All pages share layout structure ───────────────────────────────

describe('CL-§3.4 — All pages share the same layout structure', () => {
  it('LAY-08: all pages have DOCTYPE, html lang="sv", head, body', () => {
    const pages = [
      renderSchedulePage(CAMP, EVENTS),
      renderAddPage(CAMP, LOCATIONS, '/add-event'),
      renderEditPage(CAMP, LOCATIONS, '/edit-event'),
      renderIdagPage(CAMP, EVENTS),
    ];
    for (const html of pages) {
      assert.ok(html.includes('<!DOCTYPE html>'), 'has DOCTYPE');
      assert.ok(html.includes('<html lang="sv">'), 'has sv lang');
      assert.ok(html.includes('<meta charset="UTF-8">'), 'has charset');
      assert.ok(html.includes('<meta name="viewport"'), 'has viewport');
      assert.ok(html.includes('style.css'), 'has stylesheet');
    }
  });
});

// ── 02-§2.8  Pages share header and navigation ──────────────────────────────
// (Extends the SNP-01 test; verifies page-nav across all page types)

describe('02-§2.8 — All standard pages share header and navigation', () => {
  it('LAY-09: schema page has nav with active Schema link', () => {
    const html = renderSchedulePage(CAMP, EVENTS);
    assert.ok(html.includes('class="nav-link active" href="schema.html"'), 'Schema is active');
  });

  it('LAY-10: add-activity page has nav with active Lägg till link', () => {
    const html = renderAddPage(CAMP, LOCATIONS, '/add-event');
    assert.ok(html.includes('class="nav-link active" href="lagg-till.html"'), 'Lägg till is active');
  });

  it('LAY-11: idag page has nav with active Idag link', () => {
    const html = renderIdagPage(CAMP, EVENTS);
    assert.ok(html.includes('class="nav-link active" href="idag.html"'), 'Idag is active');
  });
});

// ── 02-§24.10–24.12  Mobile hamburger ───────────────────────────────────────
// (Partially tested by NAV-10, NAV-11; this adds nav-toggle-bar checks)

describe('02-§24.10 — Mobile hamburger structure', () => {
  it('LAY-12: hamburger button has three bar spans', () => {
    const nav = pageNav('index.html');
    const barCount = (nav.match(/nav-toggle-bar/g) || []).length;
    assert.strictEqual(barCount, 3, 'should have exactly 3 toggle bars');
  });

  it('LAY-13: hamburger controls nav-menu', () => {
    const nav = pageNav('index.html');
    assert.ok(nav.includes('aria-controls="nav-menu"'), 'controls nav-menu');
    assert.ok(nav.includes('id="nav-menu"'), 'nav-menu id exists');
  });
});

// ── pageNav with sections ───────────────────────────────────────────────────

describe('pageNav — section links rendering', () => {
  it('LAY-14: section links appear when navSections provided', () => {
    const nav = pageNav('schema.html', SECTIONS);
    assert.ok(nav.includes('Om lägret'), 'has section label');
    assert.ok(nav.includes('FAQ'), 'has FAQ label');
    assert.ok(nav.includes('class="nav-sections"'), 'has sections container');
  });

  it('LAY-15: no section row when navSections is empty', () => {
    const nav = pageNav('schema.html', []);
    assert.ok(!nav.includes('class="nav-sections"'), 'no sections container');
  });
});
