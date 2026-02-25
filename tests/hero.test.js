'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const {
  renderIndexPage,
} = require('../source/build/render-index');

// ── Helper: build a minimal page with hero config ─────────────────────────────

function buildPage(heroOpts = {}) {
  return {
    heroSrc: heroOpts.heroSrc ?? 'images/klaralven.webp',
    heroAlt: heroOpts.heroAlt ?? 'Klarälven vid Sysslebäck',
    sections: [{ id: 'start', navLabel: 'Om lägret', html: '<p>Intro</p>' }],
    discordUrl: heroOpts.discordUrl ?? 'https://discord.com/channels/123/456',
    facebookUrl: heroOpts.facebookUrl ?? 'https://www.facebook.com/groups/test',
    countdownTarget: heroOpts.countdownTarget ?? '2026-06-21',
  };
}

// ── Hero layout structure (02-§29.1) ──────────────────────────────────────────

describe('hero section – layout structure (02-§29.1)', () => {
  it('HERO-01: renders a .hero container', () => {
    const html = renderIndexPage(buildPage());
    assert.ok(html.includes('class="hero"'), `Expected .hero container, got: ${html.slice(0, 1500)}`);
  });

  it('HERO-02: hero contains a .hero-main area and a .hero-sidebar', () => {
    const html = renderIndexPage(buildPage());
    assert.ok(html.includes('class="hero-main"'), 'Expected .hero-main');
    assert.ok(html.includes('class="hero-sidebar"'), 'Expected .hero-sidebar');
  });
});

// ── Hero title (02-§29.3, 02-§29.4, 02-§29.5) ───────────────────────────────

describe('hero section – title (02-§29.3–29.5)', () => {
  it('HERO-03: renders "Sommarläger i Sysslebäck" as a heading', () => {
    const html = renderIndexPage(buildPage());
    assert.ok(
      html.includes('Sommarläger i Sysslebäck'),
      'Expected title text in hero',
    );
  });

  it('HERO-04: title has the hero-title class', () => {
    const html = renderIndexPage(buildPage());
    assert.ok(html.includes('class="hero-title"'), 'Expected .hero-title class');
  });
});

// ── Hero image (02-§29.6, 02-§29.7) ──────────────────────────────────────────

describe('hero section – image (02-§29.6–29.7)', () => {
  it('HERO-05: hero image has class hero-img', () => {
    const html = renderIndexPage(buildPage());
    const imgMatch = html.match(/<img[^>]*class="hero-img"[^>]*>/);
    assert.ok(imgMatch, 'Expected .hero-img element');
  });

  it('HERO-06: hero image has fetchpriority="high"', () => {
    const html = renderIndexPage(buildPage());
    const imgMatch = html.match(/<img[^>]*class="hero-img"[^>]*>/);
    assert.ok(imgMatch, 'Expected .hero-img element');
    assert.ok(
      imgMatch[0].includes('fetchpriority="high"'),
      `Expected fetchpriority="high", got: ${imgMatch[0]}`,
    );
  });
});

// ── Social links (02-§29.9, 02-§29.10, 02-§29.11) ───────────────────────────

describe('hero section – social links (02-§29.9–29.11)', () => {
  it('HERO-07: renders a Discord link with the provided URL', () => {
    const html = renderIndexPage(buildPage({ discordUrl: 'https://discord.com/test' }));
    assert.ok(
      html.includes('href="https://discord.com/test"'),
      'Expected Discord link href',
    );
  });

  it('HERO-08: renders a Facebook link with the provided URL', () => {
    const html = renderIndexPage(buildPage({ facebookUrl: 'https://facebook.com/grp' }));
    assert.ok(
      html.includes('href="https://facebook.com/grp"'),
      'Expected Facebook link href',
    );
  });

  it('HERO-09: social links open in a new tab with noopener noreferrer', () => {
    const html = renderIndexPage(buildPage());
    const socialLinks = html.match(/<a[^>]*class="hero-social-link"[^>]*>/g) || [];
    assert.ok(socialLinks.length >= 2, `Expected at least 2 social links, got ${socialLinks.length}`);
    for (const link of socialLinks) {
      assert.ok(link.includes('target="_blank"'), `Expected target="_blank", got: ${link}`);
      assert.ok(link.includes('rel="noopener noreferrer"'), `Expected rel="noopener noreferrer", got: ${link}`);
    }
  });
});

// ── Countdown (02-§29.13, 02-§29.14, 02-§29.16, 02-§29.17) ─────────────────

describe('hero section – countdown (02-§29.13–29.17)', () => {
  it('HERO-10: renders a countdown element with data-target attribute', () => {
    const html = renderIndexPage(buildPage({ countdownTarget: '2026-08-02' }));
    assert.ok(
      html.includes('data-target="2026-08-02"'),
      'Expected data-target on countdown',
    );
  });

  it('HERO-11: countdown contains "Dagar kvar" label', () => {
    const html = renderIndexPage(buildPage());
    assert.ok(
      html.includes('Dagar kvar'),
      'Expected "Dagar kvar" label in countdown',
    );
  });

  it('HERO-12: countdown is hidden when countdownTarget is null', () => {
    const html = renderIndexPage(buildPage({ countdownTarget: null }));
    // The countdown element should either not exist or be hidden
    assert.ok(
      !html.includes('data-target=') || html.includes('hidden'),
      'Expected countdown to be hidden or absent when no target',
    );
  });

  it('HERO-13: countdown has .hero-countdown class', () => {
    const html = renderIndexPage(buildPage());
    assert.ok(
      html.includes('class="hero-countdown"'),
      'Expected .hero-countdown class',
    );
  });
});

// ── Discord icon image (02-§30.24) ──────────────────────────────────────────

describe('hero section – Discord icon image (02-§30.24)', () => {
  it('HERO-16: Discord link uses DiscordLogo.webp image', () => {
    const html = renderIndexPage(buildPage());
    assert.ok(
      html.includes('src="images/DiscordLogo.webp"'),
      `Expected DiscordLogo.webp, got: ${html.match(/<img[^>]*Discord[^>]*>/)?.[0] || 'no match'}`,
    );
  });
});

// ── Social links not hardcoded (02-§29.22) ──────────────────────────────────

describe('hero section – links from config (02-§29.22)', () => {
  it('HERO-14: different Discord URLs produce different hrefs', () => {
    const html1 = renderIndexPage(buildPage({ discordUrl: 'https://discord.com/a' }));
    const html2 = renderIndexPage(buildPage({ discordUrl: 'https://discord.com/b' }));
    assert.ok(html1.includes('href="https://discord.com/a"'));
    assert.ok(html2.includes('href="https://discord.com/b"'));
  });

  it('HERO-15: different Facebook URLs produce different hrefs', () => {
    const html1 = renderIndexPage(buildPage({ facebookUrl: 'https://facebook.com/x' }));
    const html2 = renderIndexPage(buildPage({ facebookUrl: 'https://facebook.com/y' }));
    assert.ok(html1.includes('href="https://facebook.com/x"'));
    assert.ok(html2.includes('href="https://facebook.com/y"'));
  });
});
