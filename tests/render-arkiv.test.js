'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const { renderArkivPage } = require('../source/build/render-arkiv');

// Minimal camp fixtures
const campA = {
  id: '2025-06-syssleback',
  name: 'SB sommar 2025 juni',
  start_date: '2025-06-22',
  end_date: '2025-06-29',
  location: 'Sysslebäck',
  link: 'https://www.facebook.com/groups/syssleback2025',
  information: 'Info om 2025.',
  archived: true,
};

const campB = {
  id: '2024-06-syssleback',
  name: 'SB sommar 2024 juni',
  start_date: '2024-06-23',
  end_date: '2024-06-30',
  location: 'Sysslebäck',
  link: '',
  information: '',
  archived: true,
};

const activeCamp = {
  id: '2026-02-testar',
  name: 'SB vinter 2026 februari',
  start_date: '2026-02-22',
  end_date: '2026-02-27',
  location: 'Testar',
  link: '',
  information: '',
  archived: false,
};

// Sample events for testing event list rendering
const sampleEvents = [
  {
    id: 'ev-a1',
    title: 'Frukost',
    date: '2025-06-23',
    start: '08:00',
    end: '09:00',
    location: 'Matsalen',
    responsible: 'Kocken',
    description: null,
    link: null,
  },
  {
    id: 'ev-a2',
    title: 'Fotboll',
    date: '2025-06-23',
    start: '10:00',
    end: '12:00',
    location: 'Planen',
    responsible: 'Erik',
    description: 'Bring your own ball',
    link: null,
  },
  {
    id: 'ev-b1',
    title: 'Vandring',
    date: '2025-06-22',
    start: '14:00',
    end: '17:00',
    location: 'Skogen',
    responsible: 'Anna',
    description: null,
    link: null,
  },
  {
    id: 'ev-c1',
    title: 'Kvällsaktivitet',
    date: '2025-06-23',
    start: '19:00',
    end: '21:00',
    location: 'Stora salen',
    responsible: 'Lisa',
    description: null,
    link: 'https://example.com/event',
  },
];

// ── renderArkivPage ───────────────────────────────────────────────────────────

describe('renderArkivPage', () => {
  it('ARK-01: only renders camps with archived: true', () => {
    const html = renderArkivPage([campA, campB, activeCamp]);
    assert.ok(html.includes(campA.name), 'should include archived camp A');
    assert.ok(html.includes(campB.name), 'should include archived camp B');
    assert.ok(!html.includes(activeCamp.name), 'should NOT include active camp');
  });

  it('ARK-02: renders camps newest first (descending by start_date)', () => {
    const html = renderArkivPage([campB, campA]); // supply oldest first
    const posA = html.indexOf(campA.name);
    const posB = html.indexOf(campB.name);
    assert.ok(posA < posB, '2025 camp should appear before 2024 camp');
  });

  it('ARK-03: renders a panel element for each archived camp', () => {
    const html = renderArkivPage([campA, campB]);
    // Each camp should have an accordion panel div
    const panelCount = (html.match(/class="timeline-panel"/g) || []).length;
    assert.strictEqual(panelCount, 2);
  });

  it('ARK-04: accordion headers are <button> elements', () => {
    const html = renderArkivPage([campA]);
    assert.ok(html.includes('<button'), 'should render a <button> element');
  });

  it('ARK-05: accordion buttons have aria-expanded and aria-controls attributes', () => {
    const html = renderArkivPage([campA]);
    assert.ok(html.includes('aria-expanded='), 'should have aria-expanded');
    assert.ok(html.includes('aria-controls='), 'should have aria-controls');
  });

  it('ARK-06 (02-§21.8): expanded panel contains information and Facebook link but not Datum/Plats dl', () => {
    const html = renderArkivPage([campA]);
    assert.ok(html.includes('Info om 2025.'), 'should include information text');
    assert.ok(html.includes('href="https://www.facebook.com/'), 'should include Facebook link');
    assert.ok(!html.includes('class="camp-meta"'), 'should NOT have camp-meta dl');
  });

  it('ARK-07: information is omitted when empty', () => {
    const html = renderArkivPage([campB]);
    // campB has empty information — no info paragraph should appear
    assert.ok(!html.includes('class="camp-information"'), 'should not render info section');
  });

  it('ARK-07b: information is rendered when present', () => {
    const html = renderArkivPage([campA]);
    assert.ok(html.includes('Info om 2025.'), 'should render information text');
  });

  it('ARK-08: Facebook link is omitted when empty', () => {
    const html = renderArkivPage([campB]);
    // campB has empty link — no Facebook button should appear
    assert.ok(!html.includes('facebook'), 'should not render Facebook link');
  });

  it('ARK-08b: Facebook link is rendered when present', () => {
    const html = renderArkivPage([campA]);
    assert.ok(
      html.includes('href="https://www.facebook.com/groups/syssleback2025"'),
      'should render Facebook href',
    );
  });

  it('returns valid HTML with doctype for an empty camps list', () => {
    const html = renderArkivPage([]);
    assert.ok(html.startsWith('<!DOCTYPE html>'), 'should start with doctype');
    assert.ok(html.includes('<ol class="timeline">'), 'should render empty timeline');
  });

  it('escapes HTML special characters in camp name', () => {
    const xssCamp = {
      ...campA,
      name: 'Camp <script>alert(1)</script>',
    };
    const html = renderArkivPage([xssCamp]);
    assert.ok(!html.includes('<script>alert'), 'should not render unescaped script tag');
    assert.ok(html.includes('&lt;script&gt;'), 'should escape the script tag');
  });

  // ── 21.4 Header layout ──────────────────────────────────────────────────────

  it('ARK-09 (02-§21.12): header shows camp name and subdued metadata', () => {
    const html = renderArkivPage([campA]);
    assert.ok(html.includes('class="timeline-name"'), 'should have timeline-name span');
    assert.ok(html.includes('class="timeline-meta"'), 'should have timeline-meta span');
  });

  it('ARK-10 (02-§21.13): header metadata includes date range', () => {
    const html = renderArkivPage([campA]);
    // campA: 2025-06-22 to 2025-06-29 → "22–29 juni 2025"
    assert.ok(html.includes('22'), 'should include start day');
    assert.ok(html.includes('29'), 'should include end day');
  });

  it('ARK-11 (02-§21.14): header metadata includes location separated by ·', () => {
    const html = renderArkivPage([campA]);
    // The meta span should contain the dot separator and location
    const metaMatch = html.match(/class="timeline-meta"[^>]*>([\s\S]*?)<\/span>/);
    assert.ok(metaMatch, 'should find timeline-meta span');
    assert.ok(metaMatch[1].includes('·'), 'should contain · separator');
    assert.ok(metaMatch[1].includes('Sysslebäck'), 'should contain location');
  });

  // ── 21.6 Facebook logo link ──────────────────────────────────────────────────

  it('ARK-12 (02-§21.18): Facebook link uses logo image when link is present', () => {
    const html = renderArkivPage([campA]);
    assert.ok(
      html.includes('social-facebook-button-blue-icon-small.webp'),
      'should reference the Facebook logo image',
    );
    assert.ok(
      !html.includes('Facebookgrupp →'),
      'should not render old text button',
    );
  });

  it('ARK-13 (02-§21.21): Facebook logo image has alt text', () => {
    const html = renderArkivPage([campA]);
    // Find the img tag for the Facebook logo
    const imgMatch = html.match(/<img[^>]*social-facebook[^>]*>/);
    assert.ok(imgMatch, 'should have an img tag for the Facebook logo');
    assert.ok(imgMatch[0].includes('alt='), 'should have an alt attribute');
  });

  it('ARK-14 (02-§21.20): Facebook link opens in new tab', () => {
    const html = renderArkivPage([campA]);
    const linkMatch = html.match(/<a[^>]*facebook\.com[^>]*>/);
    assert.ok(linkMatch, 'should have a link to Facebook');
    assert.ok(linkMatch[0].includes('target="_blank"'), 'should open in new tab');
    assert.ok(linkMatch[0].includes('rel="noopener noreferrer"'), 'should have noopener noreferrer');
  });

  it('ARK-15 (02-§21.19): Facebook logo is placed near top of panel before camp-information', () => {
    const html = renderArkivPage([campA]);
    const fbPos = html.indexOf('social-facebook');
    const infoPos = html.indexOf('class="camp-information"');
    assert.ok(fbPos > 0, 'should have Facebook logo');
    assert.ok(infoPos > 0, 'should have camp-information');
    assert.ok(fbPos < infoPos, 'Facebook logo should appear before camp-information');
  });

  // ── 21.7 Event list in archive ───────────────────────────────────────────────

  it('ARK-16 (02-§21.22): renders events when campEventsMap is provided', () => {
    const evMap = { [campA.id]: sampleEvents };
    const html = renderArkivPage([campA], '', [], evMap);
    assert.ok(html.includes('Frukost'), 'should include event title');
    assert.ok(html.includes('Fotboll'), 'should include second event title');
    assert.ok(html.includes('Vandring'), 'should include third event title');
  });

  it('ARK-17 (02-§21.23): events are grouped by date with day headings', () => {
    const evMap = { [campA.id]: sampleEvents };
    const html = renderArkivPage([campA], '', [], evMap);
    // Should have day headings with Swedish format
    assert.ok(html.includes('söndag 22 juni 2025'), 'should have heading for June 22');
    assert.ok(html.includes('måndag 23 juni 2025'), 'should have heading for June 23');
  });

  it('ARK-18 (02-§21.24): events within a day are sorted by start time', () => {
    const evMap = { [campA.id]: sampleEvents };
    const html = renderArkivPage([campA], '', [], evMap);
    const frukostPos = html.indexOf('Frukost');
    const fotbollPos = html.indexOf('Fotboll');
    assert.ok(frukostPos < fotbollPos, 'Frukost (08:00) should appear before Fotboll (10:00)');
  });

  it('ARK-19 (02-§21.25): event rows contain time, title, and metadata', () => {
    const evMap = { [campA.id]: sampleEvents };
    const html = renderArkivPage([campA], '', [], evMap);
    assert.ok(html.includes('class="ev-time"'), 'should have ev-time span');
    assert.ok(html.includes('class="ev-title"'), 'should have ev-title span');
    assert.ok(html.includes('class="ev-meta"'), 'should have ev-meta span');
  });

  it('ARK-20 (02-§21.27): events with description or link are rendered as expandable <details>', () => {
    const evMap = { [campA.id]: sampleEvents };
    const html = renderArkivPage([campA], '', [], evMap);
    const archivePanel = html.split('class="timeline-panel"')[1];
    assert.ok(archivePanel, 'should have a timeline panel');
    // ev-a2 has description, ev-c1 has link — both should be <details>
    const detailsEventRows = (archivePanel.match(/<details class="event-row"/g) || []);
    assert.strictEqual(detailsEventRows.length, 2, 'should have 2 expandable event rows');
    // Verify description and link content are inside event-extra
    assert.ok(archivePanel.includes('Bring your own ball'), 'should render description text');
    assert.ok(archivePanel.includes('Extern länk'), 'should render external link');
  });

  it('ARK-25 (02-§21.32): events without description or link remain flat divs', () => {
    const evMap = { [campA.id]: sampleEvents };
    const html = renderArkivPage([campA], '', [], evMap);
    const archivePanel = html.split('class="timeline-panel"')[1];
    assert.ok(archivePanel, 'should have a timeline panel');
    // ev-a1 and ev-b1 have no description or link — should be plain divs
    const plainRows = (archivePanel.match(/<div class="event-row plain"/g) || []);
    assert.strictEqual(plainRows.length, 2, 'should have 2 flat event rows');
  });

  it('ARK-26 (02-§21.31): accordion panel does not contain Datum/Plats metadata', () => {
    const evMap = { [campA.id]: sampleEvents };
    const html = renderArkivPage([campA], '', [], evMap);
    assert.ok(!html.includes('class="camp-meta"'), 'should not have camp-meta dl');
    assert.ok(!html.includes('<dt>Datum</dt>'), 'should not contain Datum label');
    assert.ok(!html.includes('<dt>Plats</dt>'), 'should not contain Plats label');
  });

  it('ARK-21 (02-§21.26): day headings are not collapsible', () => {
    const evMap = { [campA.id]: sampleEvents };
    const html = renderArkivPage([campA], '', [], evMap);
    // Day headings should be h3 or similar, not <details> or <summary>
    const archivePanel = html.split('class="timeline-panel"')[1];
    // Should NOT find <details class="day"> or <summary> around day headings
    const detailsDays = (archivePanel.match(/<details class="day/g) || []);
    assert.strictEqual(detailsDays.length, 0, 'day sections should not be collapsible');
  });

  it('ARK-22 (02-§21.28): event list is omitted when camp has no events', () => {
    const evMap = { [campA.id]: [] };
    const html = renderArkivPage([campA], '', [], evMap);
    assert.ok(!html.includes('class="archive-events"'), 'should not have event list section');
  });

  it('ARK-23 (02-§21.28): event list is omitted when campEventsMap has no entry for camp', () => {
    const html = renderArkivPage([campA], '', [], {});
    assert.ok(!html.includes('class="archive-events"'), 'should not have event list section');
  });

  it('ARK-24: backward-compatible when campEventsMap is not provided', () => {
    // Existing call pattern without campEventsMap should still work
    const html = renderArkivPage([campA], '', []);
    assert.ok(html.includes(campA.name), 'should still render camp name');
    assert.ok(!html.includes('class="archive-events"'), 'should have no event list');
  });
});
