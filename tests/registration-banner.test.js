'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const { renderIndexPage } = require('../source/build/render-index');

// ── Helpers ─────────────────────────────────────────────────────────────────

function buildPage(overrides = {}) {
  return {
    heroSrc: 'images/klaralven.webp',
    heroAlt: 'Klarälven',
    sections: [
      { id: 'start', navLabel: 'Om lägret', html: '<p>Intro</p>' },
      { id: 'anmalan', navLabel: 'Anmälan', html: '<h2>Hur anmäler jag oss?</h2>\n<p>Läs reglerna.</p>' },
    ],
    discordUrl: 'https://discord.com/t',
    facebookUrl: 'https://fb.com/t',
    countdownTarget: '2026-06-21',
    registrationCamps: [],
    ...overrides,
  };
}

function makeRegCamp(overrides = {}) {
  return {
    id: '2026-06-syssleback',
    name: 'SB sommar 2026 juni',
    registrationOpens: '2026-04-15',
    registrationCloses: '2026-06-14',
    lastRegistrationLabel: '14 juni',
    ...overrides,
  };
}

// ── REGB: Hero registration banner rendering (02-§94.1–94.14, §94.18, §94.20) ─

describe('renderIndexPage – registration banners (02-§94.1–94.14, §94.18, §94.20)', () => {
  it('REGB-01: no banner container when registrationCamps is empty', () => {
    const html = renderIndexPage(buildPage({ registrationCamps: [] }));
    assert.ok(
      !html.includes('class="hero-registration-banners"'),
      'Expected no banner container when no registration camps',
    );
  });

  it('REGB-02: renders .hero-registration-banners container when camps present', () => {
    const html = renderIndexPage(buildPage({ registrationCamps: [makeRegCamp()] }));
    assert.ok(
      html.includes('class="hero-registration-banners"'),
      'Expected .hero-registration-banners container',
    );
  });

  it('REGB-03: renders one .hero-registration-banner per registrationCamp', () => {
    const html = renderIndexPage(buildPage({
      registrationCamps: [
        makeRegCamp({ id: '2026-06-syssleback', name: 'SB juni' }),
        makeRegCamp({ id: '2026-07-syssleback', name: 'SB juli', registrationOpens: '2026-05-01', registrationCloses: '2026-07-12', lastRegistrationLabel: '12 juli' }),
      ],
    }));
    const banners = html.match(/class="hero-registration-banner"/g) || [];
    assert.equal(banners.length, 2, `Expected 2 banners, got ${banners.length}`);
  });

  it('REGB-04: each banner links to #anmalan', () => {
    const html = renderIndexPage(buildPage({ registrationCamps: [makeRegCamp()] }));
    assert.ok(
      /<a[^>]*class="hero-registration-banner"[^>]*href="#anmalan"/.test(html) ||
      /<a[^>]*href="#anmalan"[^>]*class="hero-registration-banner"/.test(html),
      'Expected banner anchor with href="#anmalan"',
    );
  });

  it('REGB-05: each banner starts hidden', () => {
    const html = renderIndexPage(buildPage({ registrationCamps: [makeRegCamp()] }));
    const bannerMatch = html.match(/<a[^>]*class="hero-registration-banner"[^>]*>/);
    assert.ok(bannerMatch, 'Expected banner anchor element');
    assert.ok(
      bannerMatch[0].includes('hidden'),
      `Expected 'hidden' attribute on banner, got: ${bannerMatch[0]}`,
    );
  });

  it('REGB-06: banner carries data-opens and data-closes matching the camp window', () => {
    const html = renderIndexPage(buildPage({
      registrationCamps: [makeRegCamp({ registrationOpens: '2026-04-15', registrationCloses: '2026-06-14' })],
    }));
    assert.ok(html.includes('data-opens="2026-04-15"'), 'Expected data-opens');
    assert.ok(html.includes('data-closes="2026-06-14"'), 'Expected data-closes');
  });

  it('REGB-07: banner carries data-goatcounter-click with camp id', () => {
    const html = renderIndexPage(buildPage({
      registrationCamps: [makeRegCamp({ id: '2026-06-syssleback' })],
    }));
    assert.ok(
      html.includes('data-goatcounter-click="click-register-banner-2026-06-syssleback"'),
      'Expected per-camp goatcounter click attribute',
    );
  });

  it('REGB-08: banner title mentions the camp name and registration being open', () => {
    const html = renderIndexPage(buildPage({
      registrationCamps: [makeRegCamp({ name: 'SB sommar 2026 juni' })],
    }));
    assert.ok(html.includes('SB sommar 2026 juni'), 'Expected camp name in banner');
    assert.ok(/[Aa]nmälan/.test(html), 'Expected Swedish word "Anmälan" in banner');
    assert.ok(/öppen/i.test(html), 'Expected Swedish word "öppen" in banner');
  });

  it('REGB-09: banner meta line shows the last registration date label', () => {
    const html = renderIndexPage(buildPage({
      registrationCamps: [makeRegCamp({ lastRegistrationLabel: '14 juni' })],
    }));
    assert.ok(html.includes('14 juni'), 'Expected last-registration date in banner meta');
    assert.ok(
      /[Ss]ista anm/.test(html),
      'Expected Swedish "Sista anmälningsdag" (or similar) prefix',
    );
  });

  it('REGB-10: banners are rendered inside the hero area (before <main>\'s content div)', () => {
    const html = renderIndexPage(buildPage({ registrationCamps: [makeRegCamp()] }));
    const heroEnd = html.indexOf('<div class="content">');
    const bannerStart = html.indexOf('hero-registration-banners');
    assert.ok(bannerStart !== -1, 'Expected banners in output');
    assert.ok(heroEnd !== -1, 'Expected content div in output');
    assert.ok(
      bannerStart < heroEnd,
      'Banners must appear before the main content section',
    );
  });

  it('REGB-11: inline visibility script is emitted when banners are present', () => {
    const html = renderIndexPage(buildPage({ registrationCamps: [makeRegCamp()] }));
    assert.ok(
      html.includes('.hero-registration-banner[data-opens]'),
      'Expected inline script to query banner elements',
    );
  });

  it('REGB-12: no inline banner script when registrationCamps is empty', () => {
    const html = renderIndexPage(buildPage({ registrationCamps: [] }));
    assert.ok(
      !html.includes('.hero-registration-banner[data-opens]'),
      'Expected no banner script when no banners',
    );
  });
});

// ── REGC: Registration CTA injection (02-§94.4–94.7, §94.15–94.17, §94.19) ──

describe('renderIndexPage – registration CTA in anmalan section (02-§94.4–94.7, §94.15–94.17, §94.19)', () => {
  function pageWithAnmalan() {
    return buildPage({
      sections: [
        { id: 'start', navLabel: 'Om lägret', html: '<p>Intro</p>' },
        { id: 'anmalan', navLabel: 'Anmälan', html: '<h2>Hur anmäler jag oss?</h2>\n<p>Läs reglerna.</p>' },
      ],
    });
  }

  it('REGC-01: anmalan section contains a .registration-cta wrapper', () => {
    const html = renderIndexPage(pageWithAnmalan());
    const anmalanMatch = html.match(/<section id="anmalan"[\s\S]*?<\/section>/);
    assert.ok(anmalanMatch, 'Expected anmalan section in output');
    assert.ok(
      anmalanMatch[0].includes('class="registration-cta"'),
      'Expected .registration-cta wrapper inside anmalan section',
    );
  });

  it('REGC-02: CTA button uses .btn-primary class', () => {
    const html = renderIndexPage(pageWithAnmalan());
    const anmalanMatch = html.match(/<section id="anmalan"[\s\S]*?<\/section>/);
    assert.ok(
      /class="[^"]*btn-primary[^"]*"/.test(anmalanMatch[0]),
      'Expected .btn-primary CTA inside anmalan section',
    );
  });

  it('REGC-03: CTA href points to event-friend-ai.lovable.app', () => {
    const html = renderIndexPage(pageWithAnmalan());
    const anmalanMatch = html.match(/<section id="anmalan"[\s\S]*?<\/section>/);
    assert.ok(
      /href="https:\/\/event-friend-ai\.lovable\.app"/.test(anmalanMatch[0]),
      'Expected external registration URL in CTA href',
    );
  });

  it('REGC-04: CTA opens in a new tab with rel="noopener noreferrer"', () => {
    const html = renderIndexPage(pageWithAnmalan());
    const anmalanMatch = html.match(/<section id="anmalan"[\s\S]*?<\/section>/);
    const ctaMatch = anmalanMatch[0].match(/<a[^>]*btn-primary[^>]*>/);
    assert.ok(ctaMatch, 'Expected CTA anchor');
    assert.ok(ctaMatch[0].includes('target="_blank"'), `Expected target="_blank", got: ${ctaMatch[0]}`);
    assert.ok(ctaMatch[0].includes('rel="noopener noreferrer"'), `Expected rel="noopener noreferrer", got: ${ctaMatch[0]}`);
  });

  it('REGC-05: CTA carries data-goatcounter-click="click-register-section"', () => {
    const html = renderIndexPage(pageWithAnmalan());
    const anmalanMatch = html.match(/<section id="anmalan"[\s\S]*?<\/section>/);
    assert.ok(
      anmalanMatch[0].includes('data-goatcounter-click="click-register-section"'),
      'Expected CTA goatcounter attribute',
    );
  });

  it('REGC-06: CTA label is "Anmäl er här"', () => {
    const html = renderIndexPage(pageWithAnmalan());
    const anmalanMatch = html.match(/<section id="anmalan"[\s\S]*?<\/section>/);
    const ctaMatch = anmalanMatch[0].match(/<a[^>]*btn-primary[^>]*>([^<]*)<\/a>/);
    assert.ok(ctaMatch, 'Expected CTA anchor with inner text');
    assert.equal(ctaMatch[1].trim(), 'Anmäl er här', `Expected "Anmäl er här", got: "${ctaMatch[1]}"`);
  });

  it('REGC-07: other sections do not carry the CTA wrapper', () => {
    const html = renderIndexPage(pageWithAnmalan());
    const startMatch = html.match(/<section id="start"[\s\S]*?<\/section>/);
    assert.ok(startMatch, 'Expected start section');
    assert.ok(
      !startMatch[0].includes('registration-cta'),
      'CTA wrapper must not appear in start section',
    );
  });

  it('REGC-08: CTA is omitted when the page has no anmalan section', () => {
    const html = renderIndexPage(buildPage({
      sections: [{ id: 'start', navLabel: 'Om lägret', html: '<p>Intro</p>' }],
    }));
    assert.ok(
      !html.includes('registration-cta'),
      'CTA must not render when no anmalan section exists',
    );
  });
});

// ── REG-06: Markdown source no longer carries the bold inline link (02-§94.7) ─

describe('registration.md — markdown source (02-§94.7)', () => {
  const registrationMd = fs.readFileSync(
    path.join(__dirname, '..', 'source', 'content', 'registration.md'),
    'utf8',
  );

  it('REG-06: registration.md does not contain the bold inline "Anmäl er här" link', () => {
    assert.ok(
      !/\*\*\[Anmäl er här\]/.test(registrationMd),
      'registration.md must not contain the bold markdown link; the CTA is injected by the renderer',
    );
  });
});
