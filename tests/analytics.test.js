'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const { renderSchedulePage } = require('../source/build/render');
const { renderAddPage } = require('../source/build/render-add');
const { renderEditPage } = require('../source/build/render-edit');
const { renderIdagPage } = require('../source/build/render-idag');
const { renderTodayPage } = require('../source/build/render-today');
const { renderIndexPage } = require('../source/build/render-index');
const { renderEventPage } = require('../source/build/render-event');
const { renderArkivPage } = require('../source/build/render-arkiv');
const { renderKalenderPage } = require('../source/build/render-kalender');

// ── Shared fixtures ─────────────────────────────────────────────────────────

const CAMP = {
  id: '2099-07-syssleback',
  name: 'SB sommar 2099',
  location: 'Sysslebäck',
  start_date: '2099-07-01',
  end_date: '2099-07-07',
  opens_for_editing: '2099-06-15',
};

const EVENTS = [
  { id: 'e1', title: 'Frukost', date: '2099-07-01', start: '08:00', end: '09:00', location: 'Servicehus', responsible: 'Anna' },
];

const EVENT = EVENTS[0];

const LOCATIONS = ['Servicehus', 'Annat'];
const QR_SVG = '<svg><rect/></svg>';
const GOATCOUNTER_TAG = '<script data-goatcounter="https://sbsommar.goatcounter.com/count" async src="//gc.zgo.at/count.js"></script>';

const INDEX_PAGE = {
  heroSrc: 'images/hero.jpg',
  heroAlt: 'Camp view',
  discordUrl: null,
  facebookUrl: null,
  countdownTarget: null,
  sections: [{ id: 'start', navLabel: 'Start', html: '<p>Intro</p>' }],
};

// ── Helper: all HTML page renderers with analytics tag ──────────────────────

function allPagesWithTag(tag) {
  return [
    ['schedule', renderSchedulePage(CAMP, EVENTS, '', [], '', '', tag)],
    ['add', renderAddPage(CAMP, LOCATIONS, '/add-event', '', [], tag)],
    ['edit', renderEditPage(CAMP, LOCATIONS, '/edit-event', '', [], tag)],
    ['idag', renderIdagPage(CAMP, EVENTS, '', [], '', tag)],
    ['today', renderTodayPage(CAMP, EVENTS, QR_SVG, '', '', tag)],
    ['index', renderIndexPage(INDEX_PAGE, '', [], tag)],
    ['event', renderEventPage(EVENT, CAMP, '', '', [], tag)],
    ['arkiv', renderArkivPage([], '', [], {}, tag)],
    ['kalender', renderKalenderPage(CAMP, '', '', [], tag)],
  ];
}

// ── 02-§62.2  Every HTML page includes tracking script in <head> ────────────

describe('02-§62.2 — GoatCounter script injected in <head> of every page', () => {
  const pages = allPagesWithTag(GOATCOUNTER_TAG);

  for (const [name, html] of pages) {
    it(`ANA-${name}: ${name} page contains GoatCounter script`, () => {
      assert.ok(html.includes(GOATCOUNTER_TAG), `${name} page should contain GoatCounter script`);
    });
  }
});

// ── 02-§62.2  Script is inside <head>, not <body> ──────────────────────────

describe('02-§62.2 — GoatCounter script is inside <head>', () => {
  const pages = allPagesWithTag(GOATCOUNTER_TAG);

  for (const [name, html] of pages) {
    it(`ANA-HEAD-${name}: ${name} page has script inside <head>`, () => {
      const headMatch = html.match(/<head>([\s\S]*?)<\/head>/);
      assert.ok(headMatch, `${name} should have a <head> section`);
      assert.ok(headMatch[1].includes('gc.zgo.at/count.js'), `${name} <head> should contain GoatCounter script`);
    });
  }
});

// ── 02-§62.3  Script tag uses async attribute ───────────────────────────────

describe('02-§62.3 — GoatCounter script uses async', () => {
  it('ANA-ASYNC: tag contains async attribute', () => {
    assert.ok(GOATCOUNTER_TAG.includes(' async '), 'GoatCounter tag should have async attribute');
  });
});

// ── 02-§62.4  Script src is //gc.zgo.at/count.js ───────────────────────────

describe('02-§62.4 — GoatCounter script src', () => {
  it('ANA-SRC: tag src is //gc.zgo.at/count.js', () => {
    assert.ok(GOATCOUNTER_TAG.includes('src="//gc.zgo.at/count.js"'), 'GoatCounter tag should have correct src');
  });
});

// ── 02-§62.5  data-goatcounter attribute set from env var ───────────────────

describe('02-§62.5 — data-goatcounter attribute present', () => {
  it('ANA-ATTR: tag has data-goatcounter with counting endpoint', () => {
    assert.ok(GOATCOUNTER_TAG.includes('data-goatcounter="https://sbsommar.goatcounter.com/count"'), 'GoatCounter tag should have data-goatcounter attribute');
  });
});

// ── 02-§62.6  No script when GOATCOUNTER_URL is empty ──────────────────────

describe('02-§62.6 — No analytics script when tag is empty', () => {
  const pages = allPagesWithTag('');

  for (const [name, html] of pages) {
    it(`ANA-EMPTY-${name}: ${name} page has no GoatCounter script when tag is empty`, () => {
      assert.ok(!html.includes('gc.zgo.at'), `${name} should not contain GoatCounter script when tag is empty`);
      assert.ok(!html.includes('goatcounter'), `${name} should not contain goatcounter references when tag is empty`);
    });
  }
});

describe('02-§62.6 — No analytics script when tag is omitted', () => {
  const pagesNoArg = [
    ['schedule', renderSchedulePage(CAMP, EVENTS)],
    ['add', renderAddPage(CAMP, LOCATIONS, '/add-event')],
    ['edit', renderEditPage(CAMP, LOCATIONS, '/edit-event')],
    ['idag', renderIdagPage(CAMP, EVENTS)],
    ['today', renderTodayPage(CAMP, EVENTS, QR_SVG)],
    ['index', renderIndexPage(INDEX_PAGE)],
    ['event', renderEventPage(EVENT, CAMP, '')],
    ['arkiv', renderArkivPage([])],
    ['kalender', renderKalenderPage(CAMP, '')],
  ];

  for (const [name, html] of pagesNoArg) {
    it(`ANA-OMIT-${name}: ${name} page has no GoatCounter script when param omitted`, () => {
      assert.ok(!html.includes('gc.zgo.at'), `${name} should not contain GoatCounter when param omitted`);
    });
  }
});

// ── 02-§62.10  noindex, nofollow not affected ──────────────────────────────

describe('02-§62.10 — Analytics does not affect noindex, nofollow', () => {
  const pages = allPagesWithTag(GOATCOUNTER_TAG);

  for (const [name, html] of pages) {
    it(`ANA-ROBOTS-${name}: ${name} page still has noindex, nofollow`, () => {
      assert.ok(html.includes('noindex, nofollow'), `${name} should still have noindex, nofollow meta tag`);
    });
  }
});

// ── 02-§62.20  Social links fire GoatCounter event on click ─────────────────

const INDEX_WITH_SOCIAL = {
  heroSrc: 'images/hero.jpg',
  heroAlt: 'Camp view',
  discordUrl: 'https://discord.com/test',
  facebookUrl: 'https://facebook.com/test',
  countdownTarget: null,
  sections: [{ id: 'start', navLabel: 'Start', html: '<p>Intro</p>' }],
};

describe('02-§62.20 — Social links have data-goatcounter-click when analytics enabled', () => {
  const html = renderIndexPage(INDEX_WITH_SOCIAL, '', [], GOATCOUNTER_TAG);

  it('ANA-SOCIAL-01: Discord link has data-goatcounter-click', () => {
    assert.ok(html.includes('data-goatcounter-click="social-discord"'), 'Discord link should have goatcounter click tracking');
  });

  it('ANA-SOCIAL-02: Facebook link has data-goatcounter-click', () => {
    assert.ok(html.includes('data-goatcounter-click="social-facebook"'), 'Facebook link should have goatcounter click tracking');
  });
});

describe('02-§62.22 — Social links have no data-goatcounter-click when analytics disabled', () => {
  const html = renderIndexPage(INDEX_WITH_SOCIAL, '', [], '');

  it('ANA-SOCIAL-03: Discord link has no goatcounter attribute when disabled', () => {
    assert.ok(!html.includes('data-goatcounter-click'), 'Should not have goatcounter click attributes');
  });
});

// ── 02-§62.19  iCal links fire GoatCounter event on click ───────────────────

describe('02-§62.19 — iCal links have data-goatcounter-click when analytics enabled', () => {
  it('ANA-ICAL-01: event page .ics link has click tracking', () => {
    const html = renderEventPage(EVENT, CAMP, 'https://example.com', '', [], GOATCOUNTER_TAG);
    assert.ok(html.includes('data-goatcounter-click="ical-event"'), 'Per-event .ics link should have goatcounter click tracking');
  });

  it('ANA-ICAL-02: kalender page has .ics click tracking', () => {
    const html = renderKalenderPage(CAMP, 'https://example.com', '', [], GOATCOUNTER_TAG);
    assert.ok(html.includes('data-goatcounter-click="ical-subscribe"'), 'Webcal link should have goatcounter click tracking');
  });

  it('ANA-ICAL-03: kalender page .ics download has click tracking', () => {
    const html = renderKalenderPage(CAMP, 'https://example.com', '', [], GOATCOUNTER_TAG);
    assert.ok(html.includes('data-goatcounter-click="ical-download"'), 'Download link should have goatcounter click tracking');
  });

  it('ANA-ICAL-04: schedule page webcal link has click tracking', () => {
    const html = renderSchedulePage(CAMP, EVENTS, '', [], 'https://example.com', '', GOATCOUNTER_TAG);
    assert.ok(html.includes('data-goatcounter-click="ical-subscribe"'), 'Webcal link should have goatcounter click tracking');
  });
});

describe('02-§62.22 — iCal links have no data-goatcounter-click when analytics disabled', () => {
  it('ANA-ICAL-05: event page has no goatcounter attributes when disabled', () => {
    const html = renderEventPage(EVENT, CAMP, 'https://example.com', '', [], '');
    assert.ok(!html.includes('data-goatcounter-click'), 'Should not have goatcounter click attributes');
  });

  it('ANA-ICAL-06: kalender page has no goatcounter attributes when disabled', () => {
    const html = renderKalenderPage(CAMP, 'https://example.com', '', [], '');
    assert.ok(!html.includes('data-goatcounter-click'), 'Should not have goatcounter click attributes');
  });
});

// ── 02-§62.18  Form submit fires GoatCounter event ─────────────────────────

describe('02-§62.18 — Form submit JS contains guarded goatcounter.count()', () => {
  const addJs = fs.readFileSync(path.join(__dirname, '../source/assets/js/client/lagg-till.js'), 'utf8');
  const editJs = fs.readFileSync(path.join(__dirname, '../source/assets/js/client/redigera.js'), 'utf8');

  it('ANA-SUBMIT-01: lagg-till.js calls goatcounter.count on success', () => {
    assert.ok(addJs.includes('goatcounter'), 'lagg-till.js should reference goatcounter');
    assert.ok(addJs.includes('goatcounter.count'), 'lagg-till.js should call goatcounter.count');
  });

  it('ANA-SUBMIT-02: redigera.js calls goatcounter.count on success', () => {
    assert.ok(editJs.includes('goatcounter'), 'redigera.js should reference goatcounter');
    assert.ok(editJs.includes('goatcounter.count'), 'redigera.js should call goatcounter.count');
  });

  it('ANA-SUBMIT-03: lagg-till.js guards goatcounter call', () => {
    assert.ok(addJs.includes('window.goatcounter'), 'lagg-till.js should guard with window.goatcounter check');
  });

  it('ANA-SUBMIT-04: redigera.js guards goatcounter call', () => {
    assert.ok(editJs.includes('window.goatcounter'), 'redigera.js should guard with window.goatcounter check');
  });
});
