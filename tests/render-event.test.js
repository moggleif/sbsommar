'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const { renderEventPage } = require('../source/build/render-event');

// ── Fixtures ────────────────────────────────────────────────────────────────

const camp = {
  id: '2026-06-syssleback',
  name: 'SB Sommar Juni 2026',
  location: 'Sysslebäck',
  start_date: '2026-06-28',
  end_date: '2026-07-05',
};

const siteUrl = 'https://sommar.digitalasynctransparency.com';

const fullEvent = {
  id: 'fotboll-2026-06-29-1000',
  title: 'Fotboll',
  date: '2026-06-29',
  start: '10:00',
  end: '12:00',
  location: 'Planen',
  responsible: 'Erik',
  description: 'Alla är välkomna att spela fotboll.',
  link: 'https://example.com/fotboll',
  owner: { name: 'Secret', email: 'secret@example.com' },
  meta: { created_at: '2026-06-28T10:00:00', updated_at: null },
};

const minimalEvent = {
  id: 'frukost-2026-06-29-0800',
  title: 'Frukost',
  date: '2026-06-29',
  start: '08:00',
  end: '09:00',
  location: 'Matsalen',
  responsible: 'Kocken',
  description: null,
  link: null,
};

// ── Tests ───────────────────────────────────────────────────────────────────

describe('renderEventPage (02-§36)', () => {
  it('EVT-01 (02-§36.3): page shows event title as heading', () => {
    const html = renderEventPage(fullEvent, camp, siteUrl);
    assert.ok(html.includes('<h1>Fotboll</h1>'), 'should have title as h1');
  });

  it('EVT-02 (02-§36.3): page shows date formatted in Swedish', () => {
    const html = renderEventPage(fullEvent, camp, siteUrl);
    // 2026-06-29 is a Monday
    assert.ok(html.includes('måndag 29 juni 2026'), 'should show Swedish formatted date');
  });

  it('EVT-03 (02-§36.3): page shows start and end time', () => {
    const html = renderEventPage(fullEvent, camp, siteUrl);
    assert.ok(html.includes('10:00'), 'should show start time');
    assert.ok(html.includes('12:00'), 'should show end time');
  });

  it('EVT-04 (02-§36.3): page shows location', () => {
    const html = renderEventPage(fullEvent, camp, siteUrl);
    assert.ok(html.includes('Planen'), 'should show location');
  });

  it('EVT-05 (02-§36.3): page shows responsible person', () => {
    const html = renderEventPage(fullEvent, camp, siteUrl);
    assert.ok(html.includes('Erik'), 'should show responsible person');
  });

  it('EVT-06 (02-§36.3): page shows description when set', () => {
    const html = renderEventPage(fullEvent, camp, siteUrl);
    assert.ok(html.includes('Alla är välkomna att spela fotboll.'), 'should show description');
  });

  it('EVT-07 (02-§36.3): page shows external link when set', () => {
    const html = renderEventPage(fullEvent, camp, siteUrl);
    assert.ok(html.includes('href="https://example.com/fotboll"'), 'should show external link');
  });

  it('EVT-08 (02-§36.4): description is omitted when null', () => {
    const html = renderEventPage(minimalEvent, camp, siteUrl);
    assert.ok(!html.includes('class="event-description"'), 'should not render description section');
  });

  it('EVT-09 (02-§36.4): external link is omitted when null', () => {
    const html = renderEventPage(minimalEvent, camp, siteUrl);
    assert.ok(!html.includes('class="event-ext-link"'), 'should not render external link');
  });

  it('EVT-10 (02-§36.5): owner and meta fields are never shown', () => {
    const html = renderEventPage(fullEvent, camp, siteUrl);
    assert.ok(!html.includes('Secret'), 'should not show owner name');
    assert.ok(!html.includes('secret@example.com'), 'should not show owner email');
    assert.ok(!html.includes('created_at'), 'should not show created_at');
    assert.ok(!html.includes('updated_at'), 'should not show updated_at');
  });

  it('EVT-11 (02-§36.6): page includes shared navigation', () => {
    const html = renderEventPage(fullEvent, camp, siteUrl);
    assert.ok(html.includes('class="page-nav"'), 'should have page-nav');
  });

  it('EVT-12 (02-§36.6): page includes footer when provided', () => {
    const html = renderEventPage(fullEvent, camp, siteUrl, '<p>Footer</p>');
    assert.ok(html.includes('class="site-footer"'), 'should have site-footer');
    assert.ok(html.includes('Footer'), 'should include footer content');
  });

  it('EVT-13 (02-§36.6): page links to stylesheet', () => {
    const html = renderEventPage(fullEvent, camp, siteUrl);
    assert.ok(html.includes('style.css'), 'should link to stylesheet');
  });

  it('EVT-14 (02-§36.7): page includes back link to schedule', () => {
    const html = renderEventPage(fullEvent, camp, siteUrl);
    assert.ok(html.includes('schema.html'), 'should link back to schema.html');
  });

  it('EVT-15 (02-§36.8): page includes meta robots noindex nofollow', () => {
    const html = renderEventPage(fullEvent, camp, siteUrl);
    assert.ok(html.includes('<meta name="robots" content="noindex, nofollow">'), 'should have robots meta');
  });

  it('EVT-16: page starts with doctype and has lang="sv"', () => {
    const html = renderEventPage(fullEvent, camp, siteUrl);
    assert.ok(html.startsWith('<!DOCTYPE html>'), 'should start with doctype');
    assert.ok(html.includes('lang="sv"'), 'should have lang="sv"');
  });

  it('EVT-17: escapes HTML special characters in event fields', () => {
    const xssEvent = {
      ...fullEvent,
      title: 'Mat & Dryck <script>alert(1)</script>',
      location: 'Sal "A"',
    };
    const html = renderEventPage(xssEvent, camp, siteUrl);
    assert.ok(html.includes('&amp;'), 'should escape ampersand');
    assert.ok(html.includes('&lt;script&gt;'), 'should escape script tag');
    assert.ok(!html.includes('<script>alert'), 'should not contain unescaped script tag');
  });

  it('EVT-19 (02-§36.11): uses structured layout with date+time line and plats+ansvarig line', () => {
    const html = renderEventPage(fullEvent, camp, siteUrl);
    assert.ok(!html.includes('<dl'), 'should not use definition list');
    assert.ok(html.includes('måndag 29 juni 2026'), 'line 1 should have formatted date');
    assert.ok(html.includes('10:00–12:00'), 'line 1 should have time range');
    assert.ok(html.includes('<strong>Plats:</strong> Planen'), 'line 2 should have bold Plats label');
    assert.ok(html.includes('<strong>Ansvarig:</strong> Erik'), 'line 2 should have bold Ansvarig label');
  });

  it('EVT-20 (02-§36.11): structured layout omits description and link lines when absent', () => {
    const html = renderEventPage(minimalEvent, camp, siteUrl);
    assert.ok(html.includes('måndag 29 juni 2026'), 'line 1 should have formatted date');
    assert.ok(html.includes('08:00–09:00'), 'line 1 should have time range');
    assert.ok(html.includes('<strong>Plats:</strong> Matsalen'), 'line 2 should have bold Plats label');
    assert.ok(html.includes('<strong>Ansvarig:</strong> Kocken'), 'line 2 should have bold Ansvarig label');
    assert.ok(!html.includes('class="event-description"'), 'should not render description section');
    assert.ok(!html.includes('class="event-ext-link"'), 'should not render external link');
  });

  it('EVT-18 (02-§36.6): page title includes event title and camp name', () => {
    const html = renderEventPage(fullEvent, camp, siteUrl);
    const titleMatch = html.match(/<title>([^<]+)<\/title>/);
    assert.ok(titleMatch, 'should have title element');
    assert.ok(titleMatch[1].includes('Fotboll'), 'title should include event name');
    assert.ok(titleMatch[1].includes(camp.name), 'title should include camp name');
  });

  it('EVT-21 (02-§45.8): page includes iCal download link', () => {
    const html = renderEventPage(fullEvent, camp, siteUrl);
    assert.ok(html.includes('event.ics'), 'should link to event.ics');
  });

  it('EVT-22 (02-§45.9): iCal link is inside the event-detail section', () => {
    const html = renderEventPage(fullEvent, camp, siteUrl);
    const detailStart = html.indexOf('class="event-detail"');
    const icalPos = html.indexOf('event.ics');
    assert.ok(detailStart > 0, 'should have event-detail div');
    assert.ok(icalPos > detailStart, 'iCal link should be inside event-detail');
  });
});
