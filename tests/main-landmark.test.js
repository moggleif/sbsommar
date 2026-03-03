'use strict';

// Tests for <main> landmark element — 02-§70.1–70.5 / 07-§9.6.
//
// Every page must have exactly one <main> element wrapping the primary
// content between navigation and footer. <main> must not contain <nav>
// or <footer>.

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const { renderSchedulePage } = require('../source/build/render');
const { renderAddPage } = require('../source/build/render-add');
const { renderEditPage } = require('../source/build/render-edit');
const { renderIdagPage } = require('../source/build/render-idag');
const { renderTodayPage } = require('../source/build/render-today');
const { renderIndexPage } = require('../source/build/render-index');
const { renderArkivPage } = require('../source/build/render-arkiv');
const { renderKalenderPage } = require('../source/build/render-kalender');
const { renderEventPage } = require('../source/build/render-event');

// ── Shared fixtures ─────────────────────────────────────────────────────────

const CAMP = {
  name: 'SB sommar 2099',
  location: 'Sysslebäck',
  start_date: '2099-07-01',
  end_date: '2099-07-07',
  opens_for_editing: '2099-06-15',
};

const EVENTS = [
  { id: 'e1', title: 'Frukost', date: '2099-07-01', start: '08:00', end: '09:00', location: 'Servicehus', responsible: 'Anna' },
];

const LOCATIONS = ['Servicehus', 'Annat'];
const QR_SVG = '<svg><rect/></svg>';

const INDEX_PAGE = {
  heroSrc: 'images/hero.jpg',
  heroAlt: 'Camp view',
  discordUrl: null,
  facebookUrl: null,
  countdownTarget: null,
  sections: [{ id: 'start', navLabel: 'Start', html: '<p>Intro</p>' }],
};

const EVENT = {
  id: 'e1',
  title: 'Frukost',
  date: '2099-07-01',
  start: '08:00',
  end: '09:00',
  location: 'Servicehus',
  responsible: 'Anna',
  description: null,
  link: null,
};

const SITE_URL = 'https://example.com';

// ── Helper: count occurrences ────────────────────────────────────────────────

function countOccurrences(html, tag) {
  const re = new RegExp(tag, 'g');
  return (html.match(re) || []).length;
}

// ── Helper: extract <main> content ───────────────────────────────────────────

function getMainContent(html) {
  const match = html.match(/<main>([\s\S]*?)<\/main>/);
  return match ? match[1] : null;
}

// ── 02-§70.1 — Every page has exactly one <main> element ─────────────────────

const pages = [
  ['schedule', () => renderSchedulePage(CAMP, EVENTS)],
  ['add-activity', () => renderAddPage(CAMP, LOCATIONS, '/add-event')],
  ['edit-activity', () => renderEditPage(CAMP, LOCATIONS, '/edit-event')],
  ['idag', () => renderIdagPage(CAMP, EVENTS)],
  ['display', () => renderTodayPage(CAMP, EVENTS, QR_SVG)],
  ['index', () => renderIndexPage(INDEX_PAGE)],
  ['arkiv', () => renderArkivPage([])],
  ['kalender', () => renderKalenderPage(CAMP, SITE_URL)],
  ['event-detail', () => renderEventPage(EVENT, CAMP, SITE_URL)],
];

describe('02-§70.1 — Every page has exactly one <main> element', () => {
  for (const [name, fn] of pages) {
    it(`MAIN-01-${name}: ${name} page has exactly one <main>`, () => {
      const html = fn();
      assert.equal(countOccurrences(html, '<main>'), 1, `${name} must have one <main>`);
      assert.equal(countOccurrences(html, '</main>'), 1, `${name} must have one </main>`);
    });
  }
});

// ── 02-§70.3 — <main> does not contain <nav> or <footer> ────────────────────

describe('02-§70.3 — <main> does not contain <nav> or <footer>', () => {
  for (const [name, fn] of pages) {
    it(`MAIN-02-${name}: ${name} page <main> excludes <nav>`, () => {
      const content = getMainContent(fn());
      assert.ok(content !== null, `${name} must have <main>`);
      assert.ok(!content.includes('<nav'), `${name} <main> must not contain <nav>`);
    });

    it(`MAIN-03-${name}: ${name} page <main> excludes <footer>`, () => {
      const content = getMainContent(fn());
      assert.ok(content !== null, `${name} must have <main>`);
      assert.ok(!content.includes('<footer'), `${name} <main> must not contain <footer>`);
    });
  }
});
