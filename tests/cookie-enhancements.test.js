'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const { renderEditPage } = require('../source/build/render-edit');
const { renderAddPage } = require('../source/build/render-add');

// ── Shared fixtures ─────────────────────────────────────────────────────────

const CAMP = {
  name: 'SB sommar 2099 juli',
  location: 'Sysslebäck',
  start_date: '2099-07-01',
  end_date: '2099-07-07',
  opens_for_editing: '2099-06-15',
};

const LOCATIONS = ['Servicehus', 'Strand', 'Annat'];
const ADD_API = '/add-event';
const EDIT_API = '/edit-event';

function renderAdd() {
  return renderAddPage(CAMP, LOCATIONS, ADD_API);
}

function renderEdit() {
  return renderEditPage(CAMP, LOCATIONS, EDIT_API);
}

// ── Source helpers ───────────────────────────────────────────────────────────

const laggTillSrc = fs.readFileSync(
  path.join(__dirname, '..', 'source', 'assets', 'js', 'client', 'lagg-till.js'),
  'utf8',
);

const redigeraSrc = fs.readFileSync(
  path.join(__dirname, '..', 'source', 'assets', 'js', 'client', 'redigera.js'),
  'utf8',
);

// ── 02-§48.4 Cookie paragraph exists in add form ────────────────────────────

describe('02-§48.4 — Cookie paragraph in add form (02-§48.4)', () => {
  it('CEH-P01: add form has cookie paragraph with id', () => {
    const html = renderAdd();
    assert.ok(html.includes('id="cookie-info"'), 'cookie-info paragraph exists');
  });
});

// ── 02-§48.8 Edit page without cookie shows explanation text ────────────────

describe('02-§48.8–48.9 — Edit page no-cookie state', () => {
  it('CEH-01: edit page has no-session container', () => {
    const html = renderEdit();
    assert.ok(html.includes('id="edit-no-session"'), 'no-session div exists');
  });

  it('CEH-02: no-session text is in Swedish', () => {
    const html = renderEdit();
    const start = html.indexOf('id="edit-no-session"');
    const end = html.indexOf('</div>', start + 30);
    const section = html.substring(start, end);
    // Should mention cookies and lägg-till (add activity)
    assert.ok(section.includes('cookie') || section.includes('Cookie'),
      'mentions cookie');
    assert.ok(section.includes('lagg-till.html') || section.includes('lägg till'),
      'references add activity');
  });
});

// ── 02-§48.13–48.14 Event list on edit page ─────────────────────────────────

describe('02-§48.13–48.14 — Event list container on edit page', () => {
  it('CEH-03: edit page has event list container', () => {
    const html = renderEdit();
    assert.ok(html.includes('id="edit-my-events"'), 'my-events container exists');
  });

  it('CEH-04: redigera.js source builds links to redigera.html?id=', () => {
    assert.ok(
      redigeraSrc.includes('redigera.html?id='),
      'JS builds event links with redigera.html?id=',
    );
  });
});

// ── 02-§48.18 Event list shown when editing specific event ──────────────────

describe('02-§48.18 — Event list visible during edit', () => {
  it('CEH-05: my-events container appears before edit-section in HTML', () => {
    const html = renderEdit();
    const myEventsPos = html.indexOf('id="edit-my-events"');
    const editSectionPos = html.indexOf('id="edit-section"');
    assert.ok(myEventsPos > 0, 'my-events exists');
    assert.ok(editSectionPos > 0, 'edit-section exists');
    assert.ok(myEventsPos < editSectionPos, 'my-events before edit-section');
  });
});

// ── 02-§48.1–48.3 Auto-fill responsible (source code checks) ───────────────

describe('02-§48.1–48.3 — Auto-fill responsible person (source checks)', () => {
  it('CEH-06: lagg-till.js reads sb_responsible from localStorage', () => {
    assert.ok(
      laggTillSrc.includes('sb_responsible'),
      'JS references sb_responsible localStorage key',
    );
  });

  it('CEH-07: lagg-till.js writes sb_responsible to localStorage', () => {
    assert.ok(
      laggTillSrc.includes("setItem") && laggTillSrc.includes('sb_responsible'),
      'JS calls setItem for sb_responsible',
    );
  });
});

// ── 02-§48.5 Dynamic intro text swap (source code check) ───────────────────

describe('02-§48.5 — Dynamic cookie paragraph swap (source check)', () => {
  it('CEH-08: lagg-till.js references cookie-info element', () => {
    assert.ok(
      laggTillSrc.includes('cookie-info'),
      'JS references cookie-info element for dynamic swap',
    );
  });

  it('CEH-09: lagg-till.js checks sb_cookie_consent in localStorage', () => {
    assert.ok(
      laggTillSrc.includes('sb_cookie_consent'),
      'JS checks cookie consent status',
    );
  });
});

// ── 02-§48.10 redigera.js handles no-id case ───────────────────────────────

describe('02-§48.10 — Edit page handles missing id param', () => {
  it('CEH-10: redigera.js references edit-no-session element', () => {
    assert.ok(
      redigeraSrc.includes('edit-no-session'),
      'JS references no-session container',
    );
  });

  it('CEH-11: redigera.js references edit-my-events element', () => {
    assert.ok(
      redigeraSrc.includes('edit-my-events'),
      'JS references my-events container',
    );
  });
});
