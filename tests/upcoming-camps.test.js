'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const { renderUpcomingCampsHtml } = require('../source/build/render-index');

// ── Test fixtures ────────────────────────────────────────────────────────────

const futureCamp = {
  id: '2026-08-syssleback',
  name: 'SB Sommar Augusti 2026',
  start_date: '2026-08-02',
  end_date: '2026-08-09',
  location: 'Sysslebäck',
  link: 'https://www.facebook.com/groups/syssleback2026',
  information: 'Info om Augusti.',
  archived: false,
  active: false,
};

const futureCampJuni = {
  id: '2026-06-syssleback',
  name: 'SB Sommar Juni 2026',
  start_date: '2026-06-21',
  end_date: '2026-06-28',
  location: 'Sysslebäck',
  link: '',
  information: '',
  archived: false,
  active: false,
};

const pastCampThisYear = {
  id: '2026-02-testar',
  name: 'SB vinter februari 2026',
  start_date: '2026-02-22',
  end_date: '2026-02-24',
  location: 'Testar',
  link: '',
  information: '',
  archived: false,
  active: true,
};

const archivedCampOldYear = {
  id: '2025-08-syssleback',
  name: 'SB Sommar Augusti 2025',
  start_date: '2025-08-03',
  end_date: '2025-08-15',
  location: 'Sysslebäck',
  link: 'https://www.facebook.com/groups/syssleback2025',
  information: 'Gammal info.',
  archived: true,
  active: false,
};

const archivedCampCurrentYear = {
  id: '2026-01-test',
  name: 'SB Nyår 2026',
  start_date: '2026-01-05',
  end_date: '2026-01-10',
  location: 'Testar',
  link: '',
  information: '',
  archived: true,
  active: false,
};

// ── Filtering (02-§28.1) ────────────────────────────────────────────────────

describe('renderUpcomingCampsHtml – filtering (02-§28.1)', () => {
  it('UC-01: includes camps where archived is false', () => {
    const html = renderUpcomingCampsHtml([futureCamp, archivedCampOldYear], 2026);
    assert.ok(html.includes(futureCamp.name), 'non-archived camp should be included');
  });

  it('UC-02: includes archived camps whose start_date year matches currentYear', () => {
    const html = renderUpcomingCampsHtml([archivedCampCurrentYear, archivedCampOldYear], 2026);
    assert.ok(html.includes(archivedCampCurrentYear.name), 'archived camp from current year should be included');
  });

  it('UC-03: excludes archived camps from other years', () => {
    const html = renderUpcomingCampsHtml([archivedCampOldYear, futureCamp], 2026);
    assert.ok(!html.includes(archivedCampOldYear.name), 'archived camp from 2025 should be excluded');
  });
});

// ── Sorting (02-§28.3) ─────────────────────────────────────────────────────

describe('renderUpcomingCampsHtml – sorting (02-§28.3)', () => {
  it('UC-04: sorts camps by start_date ascending', () => {
    // Supply in reverse order to prove sorting works
    const html = renderUpcomingCampsHtml([futureCamp, futureCampJuni, pastCampThisYear], 2026);
    const posA = html.indexOf(pastCampThisYear.name);
    const posB = html.indexOf(futureCampJuni.name);
    const posC = html.indexOf(futureCamp.name);
    assert.ok(posA < posB, 'Feb camp should appear before Jun camp');
    assert.ok(posB < posC, 'Jun camp should appear before Aug camp');
  });
});

// ── Section heading (02-§28.9) ──────────────────────────────────────────────

describe('renderUpcomingCampsHtml – heading (02-§28.9)', () => {
  it('UC-05: includes heading "Kommande läger"', () => {
    const html = renderUpcomingCampsHtml([futureCamp], 2026);
    assert.ok(html.includes('Kommande läger'), 'heading should be present');
  });
});

// ── Camp item content (02-§28.11, 02-§28.12, 02-§28.13) ────────────────────

describe('renderUpcomingCampsHtml – item content (02-§28.11–28.13)', () => {
  it('UC-06: each item shows camp name, location, and date range', () => {
    const html = renderUpcomingCampsHtml([futureCamp], 2026);
    assert.ok(html.includes('SB Sommar Augusti 2026'), 'should include camp name');
    assert.ok(html.includes('Sysslebäck'), 'should include location');
    assert.ok(html.includes('2 aug'), 'should include formatted start date');
    assert.ok(html.includes('9 aug'), 'should include formatted end date');
  });

  it('UC-07: camp name is linked when link is non-empty', () => {
    const html = renderUpcomingCampsHtml([futureCamp], 2026);
    assert.ok(
      html.includes('href="https://www.facebook.com/groups/syssleback2026"'),
      'should render link href',
    );
  });

  it('UC-08: camp name is plain text when link is empty', () => {
    const html = renderUpcomingCampsHtml([futureCampJuni], 2026);
    assert.ok(!html.includes('href=""'), 'should not render empty href');
    assert.ok(html.includes('SB Sommar Juni 2026'), 'should render camp name as text');
  });

  it('UC-09: information text shown when non-empty', () => {
    const html = renderUpcomingCampsHtml([futureCamp], 2026);
    assert.ok(html.includes('Info om Augusti.'), 'should include information text');
  });

  it('UC-10: information text omitted when empty', () => {
    const html = renderUpcomingCampsHtml([futureCampJuni], 2026);
    assert.ok(!html.includes('camp-info'), 'should not render info element for empty info');
  });
});

// ── data-end attribute (02-§28.14) ──────────────────────────────────────────

describe('renderUpcomingCampsHtml – data-end attribute (02-§28.14)', () => {
  it('UC-11: each camp item has a data-end attribute', () => {
    const html = renderUpcomingCampsHtml([futureCamp], 2026);
    assert.ok(html.includes('data-end="2026-08-09"'), 'should have data-end attribute');
  });
});

// ── Unchecked indicator (02-§28.7) ──────────────────────────────────────────

describe('renderUpcomingCampsHtml – indicators (02-§28.7)', () => {
  it('UC-12: each camp item includes a check indicator element', () => {
    const html = renderUpcomingCampsHtml([futureCamp], 2026);
    assert.ok(html.includes('camp-check'), 'should have check indicator element');
  });
});

// ── HTML escaping ───────────────────────────────────────────────────────────

describe('renderUpcomingCampsHtml – HTML escaping', () => {
  it('UC-13: escapes HTML in camp name', () => {
    const xssCamp = { ...futureCamp, name: 'Camp <script>alert(1)</script>' };
    const html = renderUpcomingCampsHtml([xssCamp], 2026);
    assert.ok(!html.includes('<script>alert'), 'should not render unescaped script tag');
    assert.ok(html.includes('&lt;script&gt;'), 'should escape the script tag');
  });
});

// ── Empty list ──────────────────────────────────────────────────────────────

describe('renderUpcomingCampsHtml – empty list', () => {
  it('UC-14: returns empty string when no camps match', () => {
    const html = renderUpcomingCampsHtml([archivedCampOldYear], 2026);
    assert.strictEqual(html, '', 'should return empty string for no matching camps');
  });
});
