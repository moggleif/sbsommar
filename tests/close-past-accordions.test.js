'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const {
  renderSchedulePage,
  renderDaySection,
} = require('../source/build/render');

// ── Helper ──────────────────────────────────────────────────────────────────

function buildScheduleHtml(dates) {
  const events = dates.map((d) => ({
    id: `test-${d}`,
    title: 'Test',
    date: d,
    start: '10:00',
    end: '11:00',
    location: null,
    responsible: null,
    description: null,
    link: null,
  }));
  const camp = { name: 'Test Camp' };
  return renderSchedulePage(camp, events);
}

// ── 02-§72.7 — All days rendered with open at build time ─────────────────

describe('close-past-accordions – build output (02-§72.7)', () => {
  it('CPA-01: every day section has the open attribute in static HTML', () => {
    const html = buildScheduleHtml(['2025-06-20', '2025-06-21', '2025-06-22']);
    const dayMatches = html.match(/<details class="day"[^>]*>/g);
    assert.ok(dayMatches, 'Expected <details class="day"> elements');
    assert.strictEqual(dayMatches.length, 3);
    for (const m of dayMatches) {
      assert.ok(m.includes('open'), `Expected open attribute in: ${m}`);
    }
  });
});

// ── 02-§72.5 — Inline script present ────────────────────────────────────

describe('close-past-accordions – inline script (02-§72.5)', () => {
  it('CPA-02: schedule page contains close-past-days script', () => {
    const html = buildScheduleHtml(['2025-06-20']);
    assert.ok(
      html.includes('details.day'),
      'Expected script referencing details.day',
    );
    assert.ok(
      html.includes('removeAttribute') || html.includes('.open'),
      'Expected script that removes open attribute',
    );
  });
});

// ── 02-§72.6 — No new JS file ──────────────────────────────────────────

describe('close-past-accordions – no new JS file (02-§72.6)', () => {
  it('CPA-03: script is inline, not an external src', () => {
    const html = buildScheduleHtml(['2025-06-20']);
    // The close-past logic must not be loaded via <script src="...">
    // It should be inline within a <script> tag
    const scriptTags = html.match(/<script[^>]*>[\s\S]*?<\/script>/g) || [];
    const inlineWithDayLogic = scriptTags.some(
      (s) => !s.includes('src=') && s.includes('details.day'),
    );
    assert.ok(inlineWithDayLogic, 'Expected inline script with details.day logic');
  });
});

// ── 02-§72.8 — Only day-level details targeted ─────────────────────────

describe('close-past-accordions – targets only day details (02-§72.8)', () => {
  it('CPA-04: script selector uses details.day, not bare details', () => {
    const html = buildScheduleHtml(['2025-06-20']);
    const scriptTags = html.match(/<script[^>]*>[\s\S]*?<\/script>/g) || [];
    const dayScript = scriptTags.find(
      (s) => !s.includes('src=') && s.includes('details.day'),
    );
    assert.ok(dayScript, 'Expected inline script with details.day');
    // Must not use querySelectorAll('details') without .day qualifier
    assert.ok(
      !dayScript.includes("querySelectorAll('details')") &&
      !dayScript.includes('querySelectorAll("details")'),
      'Script must not target bare details elements',
    );
  });
});

// ── 02-§72.1 — renderDaySection still produces open attr ────────────────

describe('close-past-accordions – renderDaySection (02-§72.7)', () => {
  it('CPA-05: renderDaySection always includes open attribute', () => {
    const html = renderDaySection('2020-01-01', [
      { id: 'x', title: 'Old', date: '2020-01-01', start: '09:00' },
    ]);
    assert.ok(html.includes('open'), 'Past day must still have open in static HTML');
  });
});
