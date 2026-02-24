'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const { renderArkivPage } = require('../source/build/render-arkiv');

// Minimal camp fixtures
const campA = {
  id: '2025-06-syssleback',
  name: 'SB Sommar Juni 2025',
  start_date: '2025-06-22',
  end_date: '2025-06-29',
  location: 'Sysslebäck',
  link: 'https://www.facebook.com/groups/syssleback2025',
  information: 'Info om 2025.',
  archived: true,
  active: false,
};

const campB = {
  id: '2024-06-syssleback',
  name: 'SB Sommar Juni 2024',
  start_date: '2024-06-23',
  end_date: '2024-06-30',
  location: 'Sysslebäck',
  link: '',
  information: '',
  archived: true,
  active: false,
};

const activeCamp = {
  id: '2026-02-testar',
  name: 'SB Vinter Februari 2026',
  start_date: '2026-02-22',
  end_date: '2026-02-27',
  location: 'Testar',
  link: '',
  information: '',
  archived: false,
  active: true,
};

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

  it('ARK-06: expanded panel contains dates, location, and camp name', () => {
    const html = renderArkivPage([campA]);
    assert.ok(html.includes('Sysslebäck'), 'should include location');
    assert.ok(html.includes('2025'), 'should include year');
    assert.ok(html.includes('juni'), 'should include Swedish month name');
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
});
