'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const { renderTodayPage } = require('../source/build/render-today');

// ── Shared fixtures ─────────────────────────────────────────────────────────

const CAMP = { name: 'SB sommar 2099 juli', location: 'Sysslebäck', start_date: '2099-07-01', end_date: '2099-07-07' };

const EVENTS = [
  { title: 'Frukost', date: '2099-07-01', start: '08:00', end: '09:00', location: 'Servicehus', responsible: 'Anna', description: null, link: null },
  { title: 'Simning', date: '2099-07-02', start: '14:00', end: '15:00', location: 'Strand', responsible: 'Erik', description: 'Badklubben', link: 'https://example.com' },
];

const QR_SVG = '<svg xmlns="http://www.w3.org/2000/svg"><rect/></svg>';

// ── 02-§2.4a  Display view at /dagens-schema.html ───────────────────────────

describe('02-§2.4a — Display view rendered as display mode', () => {
  it('DIS-01: produces a <!DOCTYPE html> page', () => {
    const html = renderTodayPage(CAMP, EVENTS, QR_SVG);
    assert.ok(html.startsWith('<!DOCTYPE html>'), 'starts with DOCTYPE');
  });

  it('DIS-02: page has lang="sv"', () => {
    const html = renderTodayPage(CAMP, EVENTS, QR_SVG);
    assert.ok(html.includes('<html lang="sv">'), 'Swedish lang');
  });

  it('DIS-03: title includes camp name', () => {
    const html = renderTodayPage(CAMP, EVENTS, QR_SVG);
    assert.ok(html.includes('<title>Dagens schema'), 'Dagens schema title');
    assert.ok(html.includes('SB sommar 2099 juli'), 'camp name in title');
  });
});

// ── 02-§2.10 / 02-§4.7  Display view has no header or navigation ───────────

describe('02-§2.10 — Display view has no navigation', () => {
  it('DIS-04: no page-nav element in output', () => {
    const html = renderTodayPage(CAMP, EVENTS, QR_SVG);
    assert.ok(!html.includes('class="page-nav"'), 'no page-nav');
  });

  it('DIS-05: no hamburger button', () => {
    const html = renderTodayPage(CAMP, EVENTS, QR_SVG);
    assert.ok(!html.includes('nav-toggle'), 'no hamburger');
  });

  it('DIS-06: no nav links (Hem, Schema, etc.)', () => {
    const html = renderTodayPage(CAMP, EVENTS, QR_SVG);
    assert.ok(!html.includes('nav-link'), 'no nav-link elements');
  });
});

// ── 02-§4.6  Display view has dark background ───────────────────────────────

describe('02-§4.6 — Display mode styling', () => {
  it('DIS-07: body has class="display-mode"', () => {
    const html = renderTodayPage(CAMP, EVENTS, QR_SVG);
    assert.ok(html.includes('<body class="display-mode">'), 'display-mode class on body');
  });
});

// ── 02-§4.7  Display view requires no interaction ───────────────────────────

describe('02-§4.7 — Display view is non-interactive', () => {
  it('DIS-08: no day navigation controls rendered', () => {
    const html = renderTodayPage(CAMP, EVENTS, QR_SVG);
    assert.ok(!html.includes('prev-day'), 'no prev-day');
    assert.ok(!html.includes('next-day'), 'no next-day');
    assert.ok(!html.includes('<select'), 'no day selector');
  });

  it('DIS-09: no form elements in display mode', () => {
    const html = renderTodayPage(CAMP, EVENTS, QR_SVG);
    assert.ok(!html.includes('<form'), 'no form');
    assert.ok(!html.includes('<input'), 'no inputs');
  });
});

// ── 02-§4.13  Today view has no day navigation ─────────────────────────────

describe('02-§4.13 — No day navigation in display view', () => {
  it('DIS-10: heading is fixed "Dagens schema"', () => {
    const html = renderTodayPage(CAMP, EVENTS, QR_SVG);
    assert.ok(html.includes('<h1 id="today-heading">Dagens schema</h1>'), 'fixed heading');
  });
});

// ── Events embedded as JSON ─────────────────────────────────────────────────

describe('Display view — event data embedding', () => {
  it('DIS-11: events are embedded as window.__EVENTS__', () => {
    const html = renderTodayPage(CAMP, EVENTS, QR_SVG);
    assert.ok(html.includes('window.__EVENTS__'), 'events embedded');
  });

  it('DIS-12: embedded events contain required fields', () => {
    const html = renderTodayPage(CAMP, EVENTS, QR_SVG);
    const match = html.match(/window\.__EVENTS__\s*=\s*(\[.*?\]);/s);
    assert.ok(match, 'events JSON found');
    const events = JSON.parse(match[1]);
    assert.strictEqual(events.length, 2, 'both events embedded');
    assert.ok(events[0].title, 'title present');
    assert.ok(events[0].date, 'date present');
    assert.ok(events[0].start, 'start present');
  });

  it('DIS-13: heading prefix set to "Dagens schema"', () => {
    const html = renderTodayPage(CAMP, EVENTS, QR_SVG);
    assert.ok(html.includes("window.__HEADING_PREFIX__ = 'Dagens schema'"), 'heading prefix');
  });

  it('DIS-14: footer shown in display mode', () => {
    const html = renderTodayPage(CAMP, EVENTS, QR_SVG);
    assert.ok(html.includes('window.__SHOW_FOOTER__ = true'), 'show footer is true');
  });
});

// ── QR code embedding ───────────────────────────────────────────────────────

describe('Display view — QR code', () => {
  it('DIS-15: QR SVG is embedded in the page', () => {
    const html = renderTodayPage(CAMP, EVENTS, QR_SVG);
    assert.ok(html.includes('<svg'), 'SVG embedded');
    assert.ok(html.includes('class="qr-wrap"'), 'QR wrapper present');
  });

  it('DIS-16: sidebar with descriptive text is present', () => {
    const html = renderTodayPage(CAMP, EVENTS, QR_SVG, '', 'https://sommar.example.com');
    assert.ok(html.includes('class="dagens-sidebar"'), 'sidebar present');
    assert.ok(html.includes('class="sidebar-text"'), 'sidebar text present');
    assert.ok(html.includes('sommar.example.com'), 'site URL hostname mentioned in description');
  });
});

// ── 02-§17.3  Readable on shared display screens ───────────────────────────

describe('02-§17.3 — Display view tailored for shared screens', () => {
  it('DIS-17: uses events-today.js for client-side rendering', () => {
    const html = renderTodayPage(CAMP, EVENTS, QR_SVG);
    assert.ok(html.includes('src="events-today.js"'), 'events-today.js loaded');
  });

  it('DIS-18: no session.js loaded (display-only, no editing)', () => {
    const html = renderTodayPage(CAMP, EVENTS, QR_SVG);
    assert.ok(!html.includes('session.js'), 'no session.js in display mode');
  });
});
