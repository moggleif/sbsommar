'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const { renderSchedulePage, renderEventRow, eventExtraHtml } = require('../source/build/render');
const { renderAddPage } = require('../source/build/render-add');
const { renderEditPage } = require('../source/build/render-edit');
const { renderIdagPage } = require('../source/build/render-idag');
const { renderTodayPage } = require('../source/build/render-today');
const { renderIndexPage } = require('../source/build/render-index');

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

// ── CL-§1.1  Static build output ────────────────────────────────────────────

describe('CL-§1.1 — All pages produce static HTML', () => {
  const pages = [
    ['schedule', () => renderSchedulePage(CAMP, EVENTS)],
    ['add-activity', () => renderAddPage(CAMP, LOCATIONS, '/add-event')],
    ['edit', () => renderEditPage(CAMP, LOCATIONS, '/edit-event')],
    ['idag', () => renderIdagPage(CAMP, EVENTS)],
    ['display', () => renderTodayPage(CAMP, EVENTS, QR_SVG)],
    ['index', () => renderIndexPage(INDEX_PAGE)],
  ];

  for (const [name, fn] of pages) {
    it(`STR-${name}: ${name} page is a complete HTML string`, () => {
      const html = fn();
      assert.ok(typeof html === 'string', 'output is a string');
      assert.ok(html.includes('<!DOCTYPE html>'), 'has DOCTYPE');
      assert.ok(html.includes('</html>'), 'has closing html tag');
    });
  }
});

// ── CL-§1.2  No backend server required ─────────────────────────────────────

describe('CL-§1.2 — No server-side rendering dependencies', () => {
  it('STR-01: pages do not reference server-side template engines', () => {
    const html = renderSchedulePage(CAMP, EVENTS);
    assert.ok(!html.includes('<%'), 'no EJS');
    assert.ok(!html.includes('{{'), 'no Handlebars/Mustache');
    assert.ok(!html.includes('v-for'), 'no Vue');
    assert.ok(!html.includes('ng-'), 'no Angular');
  });
});

// ── CL-§1.3 / CL-§2.9  No client-side framework ───────────────────────────

describe('CL-§1.3 / CL-§2.9 — No client-side framework', () => {
  it('STR-02: no React, Vue, Angular, or framework references in HTML', () => {
    const pages = [
      renderSchedulePage(CAMP, EVENTS),
      renderAddPage(CAMP, LOCATIONS, '/add-event'),
      renderIdagPage(CAMP, EVENTS),
    ];
    for (const html of pages) {
      assert.ok(!html.includes('react'), 'no React');
      assert.ok(!html.includes('__NEXT'), 'no Next.js');
      assert.ok(!html.includes('vue.js'), 'no Vue');
      assert.ok(!html.includes('angular'), 'no Angular');
    }
  });
});

// ── CL-§2.7  Not a SPA ─────────────────────────────────────────────────────

describe('CL-§2.7 — Not a single-page application', () => {
  it('STR-03: no client-side routing libraries referenced', () => {
    const pages = [
      renderSchedulePage(CAMP, EVENTS),
      renderAddPage(CAMP, LOCATIONS, '/add-event'),
      renderIdagPage(CAMP, EVENTS),
    ];
    for (const html of pages) {
      assert.ok(!html.includes('history.pushState'), 'no pushState');
      assert.ok(!html.includes('react-router'), 'no react-router');
      assert.ok(!html.includes('vue-router'), 'no vue-router');
    }
  });
});

// ── 02-§1a.2  Noindex meta on all pages ─────────────────────────────────────

describe('02-§1a.2 — All pages have noindex nofollow meta', () => {
  const pages = [
    ['schedule', () => renderSchedulePage(CAMP, EVENTS)],
    ['add', () => renderAddPage(CAMP, LOCATIONS, '/add-event')],
    ['edit', () => renderEditPage(CAMP, LOCATIONS, '/edit-event')],
    ['idag', () => renderIdagPage(CAMP, EVENTS)],
    ['display', () => renderTodayPage(CAMP, EVENTS, QR_SVG)],
    ['index', () => renderIndexPage(INDEX_PAGE)],
  ];

  for (const [name, fn] of pages) {
    it(`STR-NOINDEX-${name}: ${name} page has noindex meta`, () => {
      const html = fn();
      assert.ok(html.includes('<meta name="robots" content="noindex, nofollow">'), `${name} has noindex`);
    });
  }
});

// ── 02-§25.6  nav.js defer on all pages ─────────────────────────────────────

describe('02-§25.6 — nav.js has defer attribute on all pages', () => {
  const standardPages = [
    ['schedule', () => renderSchedulePage(CAMP, EVENTS)],
    ['add', () => renderAddPage(CAMP, LOCATIONS, '/add-event')],
    ['edit', () => renderEditPage(CAMP, LOCATIONS, '/edit-event')],
    ['idag', () => renderIdagPage(CAMP, EVENTS)],
    ['index', () => renderIndexPage(INDEX_PAGE)],
  ];

  for (const [name, fn] of standardPages) {
    it(`STR-DEFER-${name}: ${name} page has nav.js with defer`, () => {
      const html = fn();
      assert.ok(html.includes('src="nav.js" defer'), `${name} has deferred nav.js`);
    });
  }
});

// ── All pages have viewport and charset ─────────────────────────────────────

describe('All pages — meta tags', () => {
  const pages = [
    ['schedule', () => renderSchedulePage(CAMP, EVENTS)],
    ['add', () => renderAddPage(CAMP, LOCATIONS, '/add-event')],
    ['edit', () => renderEditPage(CAMP, LOCATIONS, '/edit-event')],
    ['idag', () => renderIdagPage(CAMP, EVENTS)],
    ['display', () => renderTodayPage(CAMP, EVENTS, QR_SVG)],
    ['index', () => renderIndexPage(INDEX_PAGE)],
  ];

  for (const [name, fn] of pages) {
    it(`STR-META-${name}: ${name} has charset and viewport`, () => {
      const html = fn();
      assert.ok(html.includes('<meta charset="UTF-8">'), `${name} has charset`);
      assert.ok(html.includes('name="viewport"'), `${name} has viewport`);
    });
  }
});

// ── All pages link to style.css ─────────────────────────────────────────────

describe('All pages — stylesheet', () => {
  const pages = [
    ['schedule', () => renderSchedulePage(CAMP, EVENTS)],
    ['add', () => renderAddPage(CAMP, LOCATIONS, '/add-event')],
    ['edit', () => renderEditPage(CAMP, LOCATIONS, '/edit-event')],
    ['idag', () => renderIdagPage(CAMP, EVENTS)],
    ['display', () => renderTodayPage(CAMP, EVENTS, QR_SVG)],
    ['index', () => renderIndexPage(INDEX_PAGE)],
  ];

  for (const [name, fn] of pages) {
    it(`STR-CSS-${name}: ${name} links to style.css`, () => {
      const html = fn();
      assert.ok(html.includes('href="style.css"'), `${name} links to style.css`);
    });
  }
});

// ── 02-§4.3  Event detail fields ────────────────────────────────────────────

describe('02-§4.3 — Event shows title, times, location, responsible', () => {
  it('STR-EVT-01: event row shows all required info', () => {
    const e = { id: 'e1', title: 'Simning', date: '2099-07-01', start: '14:00', end: '15:00', location: 'Strand', responsible: 'Erik' };
    const html = renderEventRow(e);
    assert.ok(html.includes('Simning'), 'title');
    assert.ok(html.includes('14:00'), 'start time');
    assert.ok(html.includes('15:00'), 'end time');
    assert.ok(html.includes('Strand'), 'location');
    assert.ok(html.includes('Erik'), 'responsible');
  });
});

// ── 02-§5.2  Empty fields omitted ───────────────────────────────────────────

describe('02-§5.2 — Empty fields omitted from extra HTML', () => {
  it('STR-EVT-02: null description produces no event-desc paragraph', () => {
    const e = { title: 'Test', description: null, link: null };
    const html = eventExtraHtml(e);
    assert.ok(!html.includes('event-desc'), 'no description paragraph');
  });

  it('STR-EVT-03: null link produces no external link', () => {
    const e = { title: 'Test', description: null, link: null };
    const html = eventExtraHtml(e);
    assert.ok(!html.includes('event-ext-link'), 'no external link');
  });

  it('STR-EVT-04: empty description+link produces empty event-extra div', () => {
    const e = { title: 'Test', description: null, link: null };
    const html = eventExtraHtml(e);
    assert.ok(html.includes('<div class="event-extra"></div>'), 'empty extra div');
  });
});

// ── 02-§18.28 / 02-§18.29  events.json structure ───────────────────────────
// We test this via the build.js PUBLIC_EVENT_FIELDS logic indirectly.

describe('02-§18.29 — events.json excludes owner and meta', () => {
  it('STR-JSON-01: event embedded in idag.html excludes owner and meta', () => {
    const events = [
      { id: 'e1', title: 'Frukost', date: '2099-07-01', start: '08:00', end: '09:00',
        location: 'Servicehus', responsible: 'Anna', description: null, link: null,
        owner: { name: 'Admin' }, meta: { created_at: '2099-01-01' } },
    ];
    const html = renderIdagPage(CAMP, events);
    const match = html.match(/window\.__EVENTS__\s*=\s*(\[.*?\]);/s);
    const embedded = JSON.parse(match[1]);
    assert.ok(!('owner' in embedded[0]), 'owner excluded');
    assert.ok(!('meta' in embedded[0]), 'meta excluded');
  });

  it('STR-JSON-02: event embedded in display page excludes owner and meta', () => {
    const events = [
      { id: 'e1', title: 'Frukost', date: '2099-07-01', start: '08:00', end: '09:00',
        location: 'Servicehus', responsible: 'Anna', description: null, link: null,
        owner: { name: 'Admin' }, meta: { created_at: '2099-01-01' } },
    ];
    const html = renderTodayPage(CAMP, events, QR_SVG);
    const match = html.match(/window\.__EVENTS__\s*=\s*(\[.*?\]);/s);
    const embedded = JSON.parse(match[1]);
    assert.ok(!('owner' in embedded[0]), 'owner excluded from display');
    assert.ok(!('meta' in embedded[0]), 'meta excluded from display');
  });
});

// ── 02-§18.18  Event rows carry data-event-id ───────────────────────────────

describe('02-§18.18 — Event rows have data-event-id in schedule', () => {
  it('STR-EID-01: schedule page event rows have data-event-id', () => {
    const events = [
      { id: 'my-event-id', title: 'Workshop', date: '2099-07-01', start: '10:00', end: '11:00', location: 'Skog', responsible: 'Lisa' },
    ];
    const html = renderSchedulePage(CAMP, events);
    assert.ok(html.includes('data-event-id="my-event-id"'), 'data-event-id in schedule');
  });
});

// ── 05-§4.5  All times are local ────────────────────────────────────────────

describe('05-§4.5 — No timezone handling', () => {
  it('STR-TZ-01: no timezone references in schedule page output', () => {
    const html = renderSchedulePage(CAMP, EVENTS);
    assert.ok(!html.includes('UTC'), 'no UTC');
    assert.ok(!html.includes('timezone'), 'no timezone');
    assert.ok(!html.includes('Z"'), 'no Z suffix in times');
  });
});
