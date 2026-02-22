'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const { renderSchedulePage } = require('../source/render');
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
});
