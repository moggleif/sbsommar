'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const { renderRssFeed } = require('../source/build/render-rss');

// ── Fixtures ────────────────────────────────────────────────────────────────

const camp = {
  id: '2026-06-syssleback',
  name: 'SB Sommar Juni 2026',
  location: 'Sysslebäck',
  start_date: '2026-06-28',
  end_date: '2026-07-05',
};

const siteUrl = 'https://sommar.digitalasynctransparency.com';

const events = [
  {
    id: 'frukost-2026-06-29-0800',
    title: 'Frukost',
    date: '2026-06-29',
    start: '08:00',
    end: '09:00',
    location: 'Matsalen',
    responsible: 'Kocken',
    description: null,
    link: null,
  },
  {
    id: 'fotboll-2026-06-29-1000',
    title: 'Fotboll',
    date: '2026-06-29',
    start: '10:00',
    end: '12:00',
    location: 'Planen',
    responsible: 'Erik',
    description: 'Alla är välkomna!',
    link: 'https://example.com/fotboll',
  },
  {
    id: 'vandring-2026-06-30-1400',
    title: 'Vandring',
    date: '2026-06-30',
    start: '14:00',
    end: '17:00',
    location: 'Skogen',
    responsible: 'Anna',
    description: null,
    link: null,
  },
];

// ── Tests ───────────────────────────────────────────────────────────────────

describe('renderRssFeed (02-§15)', () => {
  it('RSS-01 (02-§15.3): output is valid RSS 2.0 XML with xml declaration and rss element', () => {
    const xml = renderRssFeed(camp, events, siteUrl);
    assert.ok(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>'), 'should start with xml declaration');
    assert.ok(xml.includes('<rss version="2.0">'), 'should contain rss 2.0 element');
    assert.ok(xml.includes('</rss>'), 'should close rss element');
  });

  it('RSS-02 (02-§15.4): feed metadata is in Swedish', () => {
    const xml = renderRssFeed(camp, events, siteUrl);
    assert.ok(xml.includes(`<title>Schema – ${camp.name}</title>`), 'title should be Swedish');
    assert.ok(xml.includes(`<description>Aktivitetsschema för ${camp.name}</description>`), 'description in Swedish');
    assert.ok(xml.includes('<language>sv</language>'), 'language should be sv');
  });

  it('RSS-03 (02-§15.5): feed link points to weekly schedule via siteUrl', () => {
    const xml = renderRssFeed(camp, events, siteUrl);
    assert.ok(xml.includes(`<link>${siteUrl}/schema.html</link>`), 'feed link should point to schema.html');
  });

  it('RSS-04 (02-§15.6): one item per event', () => {
    const xml = renderRssFeed(camp, events, siteUrl);
    const itemCount = (xml.match(/<item>/g) || []).length;
    assert.strictEqual(itemCount, events.length, 'should have one item per event');
  });

  it('RSS-05 (02-§15.7): each item has title, link, guid, description, pubDate', () => {
    const xml = renderRssFeed(camp, events, siteUrl);
    for (const e of events) {
      const expectedUrl = `${siteUrl}/schema/${e.id}/`;
      assert.ok(xml.includes(`<title>${e.title}</title>`), `item should have title for ${e.title}`);
      assert.ok(xml.includes(`<link>${expectedUrl}</link>`), `item should have link for ${e.title}`);
      assert.ok(xml.includes(`<guid isPermaLink="true">${expectedUrl}</guid>`), `item should have guid for ${e.title}`);
      assert.ok(xml.includes('<pubDate>'), `item should have pubDate for ${e.title}`);
      assert.ok(xml.includes('<description>'), `item should have description for ${e.title}`);
    }
  });

  it('RSS-06 (02-§15.7): item description includes date, time, location, responsible', () => {
    const xml = renderRssFeed(camp, events, siteUrl);
    assert.ok(xml.includes('08:00'), 'description should include start time');
    assert.ok(xml.includes('Matsalen'), 'description should include location');
    assert.ok(xml.includes('Kocken'), 'description should include responsible');
  });

  it('RSS-07 (02-§15.7): item description includes event description when set', () => {
    const xml = renderRssFeed(camp, events, siteUrl);
    assert.ok(xml.includes('Alla är välkomna!'), 'description should include event description text');
  });

  it('RSS-13 (02-§15.15): description uses structured multi-line format', () => {
    const xml = renderRssFeed(camp, events, siteUrl);

    // Event with description and link (Fotboll)
    // Line 1: date, start–end (no labels)
    assert.ok(xml.includes('måndag 29 juni 2026, 10:00–12:00'), 'line 1 should have date and time range');
    // Line 2: labelled location and responsible
    assert.ok(xml.includes('Plats: Planen · Ansvarig: Erik'), 'line 2 should have labelled plats and ansvarig');
    // Line 3: description text
    assert.ok(xml.includes('Alla är välkomna!'), 'line 3 should have description');
    // Line 4: link
    assert.ok(xml.includes('Alla är välkomna!\nhttps://example.com/fotboll'), 'line 4 should have link after description');

    // Event without description or link (Frukost)
    assert.ok(xml.includes('måndag 29 juni 2026, 08:00–09:00'), 'should have date+time for Frukost');
    assert.ok(xml.includes('Plats: Matsalen · Ansvarig: Kocken'), 'should have labelled plats+ansvarig for Frukost');
  });

  it('RSS-14 (02-§15.15): lines are separated by newlines', () => {
    const xml = renderRssFeed(camp, events, siteUrl);
    // Extract all description elements
    const descriptions = [...xml.matchAll(/<description>([^]*?)<\/description>/g)].map((m) => m[1]);
    // Fotboll is the second event (after Frukost, same date, later start)
    const fotbollDesc = descriptions.find((d) => d.includes('Planen'));
    assert.ok(fotbollDesc, 'should find description containing Planen');
    const lines = fotbollDesc.split('\n').map((l) => l.trim()).filter(Boolean);
    assert.strictEqual(lines.length, 4, `should have 4 lines, got: ${JSON.stringify(lines)}`);
  });

  it('RSS-15 (02-§15.15): description omits lines for missing optional fields', () => {
    const xml = renderRssFeed(camp, events, siteUrl);
    // Extract all description elements
    const descriptions = [...xml.matchAll(/<description>([^]*?)<\/description>/g)].map((m) => m[1]);
    // Frukost (no description, no link)
    const frukostDesc = descriptions.find((d) => d.includes('Matsalen'));
    assert.ok(frukostDesc, 'should find description containing Matsalen');
    const lines = frukostDesc.split('\n').map((l) => l.trim()).filter(Boolean);
    assert.strictEqual(lines.length, 2, `should have 2 lines when no description/link, got: ${JSON.stringify(lines)}`);
  });

  it('RSS-08 (02-§15.8): items are sorted chronologically', () => {
    // Pass events in reverse order
    const reversed = [...events].reverse();
    const xml = renderRssFeed(camp, reversed, siteUrl);
    const frukostPos = xml.indexOf('frukost-2026-06-29-0800');
    const fotbollPos = xml.indexOf('fotboll-2026-06-29-1000');
    const vandringPos = xml.indexOf('vandring-2026-06-30-1400');
    assert.ok(frukostPos < fotbollPos, 'Frukost should appear before Fotboll');
    assert.ok(fotbollPos < vandringPos, 'Fotboll should appear before Vandring');
  });

  it('RSS-09 (02-§15.10): no external RSS library import', () => {
    const fs = require('fs');
    const path = require('path');
    const src = fs.readFileSync(path.join(__dirname, '..', 'source', 'build', 'render-rss.js'), 'utf8');
    assert.ok(!src.includes('require(\'rss'), 'should not import rss library');
    assert.ok(!src.includes('require("rss'), 'should not import rss library');
    assert.ok(!src.includes('require(\'feed'), 'should not import feed library');
    assert.ok(!src.includes('require("feed'), 'should not import feed library');
  });

  it('RSS-10: handles empty events array', () => {
    const xml = renderRssFeed(camp, [], siteUrl);
    assert.ok(xml.includes('<channel>'), 'should still have channel');
    const itemCount = (xml.match(/<item>/g) || []).length;
    assert.strictEqual(itemCount, 0, 'should have no items');
  });

  it('RSS-11: escapes XML special characters in event fields', () => {
    const xssEvents = [{
      id: 'test-xss-2026-06-29-0800',
      title: 'Mat & Dryck <special>',
      date: '2026-06-29',
      start: '08:00',
      end: '09:00',
      location: 'Sal "A"',
      responsible: "O'Brien",
      description: null,
      link: null,
    }];
    const xml = renderRssFeed(camp, xssEvents, siteUrl);
    assert.ok(xml.includes('Mat &amp; Dryck &lt;special&gt;'), 'should escape & and < in title');
    assert.ok(!xml.includes('<special>'), 'should not contain unescaped tag');
  });

  it('RSS-12 (02-§15.7): pubDate is RFC 822 formatted', () => {
    const xml = renderRssFeed(camp, events, siteUrl);
    // RFC 822 format: "Mon, 29 Jun 2026 08:00:00 +0000"
    const pubDateMatch = xml.match(/<pubDate>([^<]+)<\/pubDate>/);
    assert.ok(pubDateMatch, 'should have a pubDate element');
    // Check it contains day-of-week and timezone
    assert.ok(/\w{3}, \d{2} \w{3} \d{4} \d{2}:\d{2}:\d{2} \+0000/.test(pubDateMatch[1]),
      `pubDate should be RFC 822 format, got: ${pubDateMatch[1]}`);
  });
});
