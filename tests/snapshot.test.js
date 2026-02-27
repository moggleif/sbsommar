'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const { renderSchedulePage } = require('../source/build/render');
const { matchSnapshot } = require('./helpers/snapshot');

const CAMP = {
  id: 'test-2025',
  name: 'Test Camp 2025',
  location: 'Testville',
  start_date: '2025-06-22',
  end_date: '2025-06-23',
};

const EVENTS = [
  {
    id: 'frukost-22',
    title: 'Frukost',
    date: '2025-06-22',
    start: '08:00',
    end: '09:00',
    location: 'Matsalen',
    responsible: 'alla',
    description: null,
    link: null,
  },
  {
    id: 'workshop-22',
    title: 'Workshop',
    date: '2025-06-22',
    start: '10:00',
    end: '12:00',
    location: 'Salen',
    responsible: 'Bob',
    description: 'A useful workshop.\n\nBring your laptop.',
    link: 'https://example.com',
  },
  // Intentionally out of time order to verify sorting
  {
    id: 'kväll-22',
    title: 'Kvällsmys',
    date: '2025-06-22',
    start: '20:00',
    end: '22:00',
    location: 'Stugan',
    responsible: 'Anna',
    description: null,
    link: null,
  },
  {
    id: 'swim-23',
    title: 'Evening Swim',
    date: '2025-06-23',
    start: '18:00',
    end: null,
    location: 'Sjön',
    responsible: 'alla',
    description: null,
    link: null,
  },
];

describe('renderSchedulePage', () => {
  it('produces valid HTML structure', () => {
    const html = renderSchedulePage(CAMP, EVENTS);
    assert.ok(html.includes('<!DOCTYPE html>'), 'Expected doctype');
    assert.ok(html.includes('<html lang="sv">'), 'Expected html element');
    assert.ok(html.includes('</html>'), 'Expected closing html tag');
    assert.ok(html.includes('<title>Schema – Test Camp 2025</title>'), 'Expected title');
    assert.ok(html.includes('<h1>Schema – Test Camp 2025</h1>'), 'Expected h1');
  });

  it('renders all events', () => {
    const html = renderSchedulePage(CAMP, EVENTS);
    assert.ok(html.includes('Frukost'), 'Expected Frukost');
    assert.ok(html.includes('Workshop'), 'Expected Workshop');
    assert.ok(html.includes('Kvällsmys'), 'Expected Kvällsmys');
    assert.ok(html.includes('Evening Swim'), 'Expected Evening Swim');
  });

  it('renders day sections in chronological order', () => {
    const html = renderSchedulePage(CAMP, EVENTS);
    const pos22 = html.indexOf('id="2025-06-22"');
    const pos23 = html.indexOf('id="2025-06-23"');
    assert.ok(pos22 > -1, 'Expected day 2025-06-22');
    assert.ok(pos23 > -1, 'Expected day 2025-06-23');
    assert.ok(pos22 < pos23, 'Day 22 must appear before day 23');
  });

  it('escapes HTML in camp name', () => {
    const html = renderSchedulePage({ ...CAMP, name: 'Camp <X> & "Y"' }, []);
    assert.ok(html.includes('Camp &lt;X&gt; &amp; &quot;Y&quot;'), 'Expected escaped camp name');
    assert.ok(!html.includes('<X>'), 'Must not contain raw <X>');
  });

  it('handles an empty events list gracefully', () => {
    const html = renderSchedulePage(CAMP, []);
    assert.ok(html.includes('<!DOCTYPE html>'), 'Expected valid HTML even with no events');
    assert.ok(html.includes('Test Camp 2025'), 'Expected camp name');
  });

  it('matches the HTML snapshot', () => {
    const html = renderSchedulePage(CAMP, EVENTS);
    matchSnapshot(html, 'renderSchedulePage');
  });

  it('SNP-07 (02-§45.13): includes webcal link when siteUrl is provided', () => {
    const html = renderSchedulePage(CAMP, EVENTS, '', [], 'https://sommar.example.com');
    assert.ok(html.includes('webcal://'), 'should have webcal:// link');
    assert.ok(html.includes('webcal://sommar.example.com/schema.ics'), 'should link to schema.ics via webcal');
  });

  it('SNP-08 (02-§45.14): webcal link replaces https with webcal scheme', () => {
    const html = renderSchedulePage(CAMP, EVENTS, '', [], 'https://sommar.example.com');
    assert.ok(html.includes('webcal://sommar.example.com/schema.ics'), 'should use webcal scheme');
    assert.ok(!html.includes('https://sommar.example.com/schema.ics'), 'should not use https for webcal link');
  });

  it('SNP-09 (02-§46.1): schedule header has SVG calendar icon', () => {
    const html = renderSchedulePage(CAMP, EVENTS, '', [], 'https://sommar.example.com');
    assert.ok(html.includes('<svg'), 'should have inline SVG icon');
    assert.ok(html.includes('ical-icon'), 'should have ical-icon class');
  });

  it('SNP-10 (02-§46.3): calendar icon has no text label', () => {
    const html = renderSchedulePage(CAMP, EVENTS, '', [], 'https://sommar.example.com');
    assert.ok(!html.includes('📆'), 'should not have calendar emoji');
  });

  it('SNP-11 (02-§46.4): calendar icon links to kalender.html', () => {
    const html = renderSchedulePage(CAMP, EVENTS, '', [], 'https://sommar.example.com');
    assert.ok(html.includes('href="kalender.html"'), 'should link to kalender.html');
  });

  it('SNP-12 (02-§46.5): event rows include per-event iCal download link', () => {
    const html = renderSchedulePage(CAMP, EVENTS, '', [], 'https://sommar.example.com');
    assert.ok(html.includes('schema/frukost-22/event.ics'), 'should link to frukost event.ics');
    assert.ok(html.includes('schema/workshop-22/event.ics'), 'should link to workshop event.ics');
  });

  it('SNP-13 (02-§46.8): per-event iCal links have download attribute', () => {
    const html = renderSchedulePage(CAMP, EVENTS, '', [], 'https://sommar.example.com');
    const icalLinks = html.match(/<a [^>]*event\.ics[^>]*>/g) || [];
    assert.ok(icalLinks.length > 0, 'should have event.ics links');
    for (const link of icalLinks) {
      assert.ok(link.includes('download'), 'each event.ics link should have download attribute');
    }
  });

  it('SNP-14 (02-§46.9): schedule page links to kalender.html for subscription guide', () => {
    const html = renderSchedulePage(CAMP, EVENTS, '', [], 'https://sommar.example.com');
    assert.ok(html.includes('kalender.html'), 'should reference kalender.html');
  });
});
