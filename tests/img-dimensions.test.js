'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const fs = require('fs');

const {
  renderIndexPage,
  renderLocationAccordions,
} = require('../source/build/render-index');

const { renderSchedulePage } = require('../source/build/render');
const { renderArkivPage } = require('../source/build/render-arkiv');

const FIXTURES_DIR = path.join(__dirname, 'fixtures');

// ── Helper: build a minimal index page ──────────────────────────────────────

function buildPage(overrides = {}) {
  return {
    heroSrc: overrides.heroSrc ?? 'images/klaralven.webp',
    heroAlt: overrides.heroAlt ?? 'Klarälven',
    heroDims: overrides.heroDims ?? { width: 960, height: 720 },
    sections: overrides.sections ?? [{ id: 'start', navLabel: 'Start', html: '<p>Hello</p>' }],
    discordUrl: overrides.discordUrl ?? 'https://discord.com/channels/1/2',
    facebookUrl: overrides.facebookUrl ?? 'https://facebook.com/groups/test',
    countdownTarget: overrides.countdownTarget ?? null,
  };
}

// ── 02-§66.1 — Testimonial images: width="60" height="60" ──────────────────

describe('02-§66.1 — Testimonial image dimensions', () => {
  it('DIM-01: testimonial-img has width="60" height="60"', () => {
    // Provide HTML that wrapTestimonialCards will process:
    // <h3>Name</h3> followed by <p><img class="content-img"...></p> + blockquote
    const testimonialHtml = [
      '<h2>Omdömen</h2>',
      '<h3>Anita</h3>',
      '<p><img src="images/Anita-portrait.webp" alt="Anita" class="content-img" loading="lazy"></p>',
      '<blockquote><p>Fantastiskt läger!</p></blockquote>',
    ].join('\n');

    const html = renderIndexPage(buildPage({
      sections: [{ id: 'testimonials', navLabel: 'Omdömen', html: testimonialHtml }],
    }));

    const imgMatch = html.match(/<img[^>]*class="testimonial-img"[^>]*>/);
    assert.ok(imgMatch, 'Expected testimonial-img element');
    assert.ok(imgMatch[0].includes('width="60"'), `Expected width="60", got: ${imgMatch[0]}`);
    assert.ok(imgMatch[0].includes('height="60"'), `Expected height="60", got: ${imgMatch[0]}`);
  });
});

// ── 02-§66.2 — Social icons: width="32" height="32" ────────────────────────

describe('02-§66.2 — Social icon dimensions', () => {
  it('DIM-02: Discord icon has width="32" height="32"', () => {
    const html = renderIndexPage(buildPage());
    const imgMatch = html.match(/<img[^>]*DiscordLogo\.webp[^>]*>/);
    assert.ok(imgMatch, 'Expected Discord icon img');
    assert.ok(imgMatch[0].includes('width="32"'), `Expected width="32", got: ${imgMatch[0]}`);
    assert.ok(imgMatch[0].includes('height="32"'), `Expected height="32", got: ${imgMatch[0]}`);
  });

  it('DIM-03: Facebook icon has width="32" height="32"', () => {
    const html = renderIndexPage(buildPage());
    const imgMatch = html.match(/<img[^>]*social-facebook[^>]*>/);
    assert.ok(imgMatch, 'Expected Facebook icon img');
    assert.ok(imgMatch[0].includes('width="32"'), `Expected width="32", got: ${imgMatch[0]}`);
    assert.ok(imgMatch[0].includes('height="32"'), `Expected height="32", got: ${imgMatch[0]}`);
  });
});

// ── 02-§66.3 — RSS icon dimensions ─────────────────────────────────────────

describe('02-§66.3 — RSS icon dimensions', () => {
  it('DIM-04: RSS icon has width and height attributes', () => {
    const camp = { name: 'Test Camp' };
    const events = [];
    const html = renderSchedulePage(camp, events, '', [], 'https://example.com');
    const imgMatch = html.match(/<img[^>]*class="rss-icon"[^>]*>/);
    assert.ok(imgMatch, 'Expected rss-icon img element');
    assert.ok(/width="\d+"/.test(imgMatch[0]), `Expected width attribute, got: ${imgMatch[0]}`);
    assert.ok(/height="\d+"/.test(imgMatch[0]), `Expected height attribute, got: ${imgMatch[0]}`);
  });
});

// ── 02-§66.4 — Archive Facebook logo dimensions ────────────────────────────

describe('02-§66.4 — Archive Facebook logo dimensions', () => {
  it('DIM-05: archive Facebook logo has width and height attributes', () => {
    const camps = [{
      id: '2025-06-test',
      name: 'Test 2025',
      start_date: '2025-06-22',
      end_date: '2025-06-29',
      location: 'Sysslebäck',
      link: 'https://facebook.com/groups/test',
      information: 'Info',
      archived: true,
    }];
    const html = renderArkivPage(camps);
    const imgMatch = html.match(/<img[^>]*class="camp-fb-logo"[^>]*>/);
    assert.ok(imgMatch, 'Expected camp-fb-logo img element');
    assert.ok(/width="\d+"/.test(imgMatch[0]), `Expected width attribute, got: ${imgMatch[0]}`);
    assert.ok(/height="\d+"/.test(imgMatch[0]), `Expected height attribute, got: ${imgMatch[0]}`);
  });
});

// ── 02-§66.5 — Hero image dimensions ───────────────────────────────────────

describe('02-§66.5 — Hero image dimensions', () => {
  it('DIM-06: hero image has width and height attributes', () => {
    const html = renderIndexPage(buildPage());
    const imgMatch = html.match(/<img[^>]*class="hero-img"[^>]*>/);
    assert.ok(imgMatch, 'Expected hero-img element');
    assert.ok(/width="\d+"/.test(imgMatch[0]), `Expected width attribute, got: ${imgMatch[0]}`);
    assert.ok(/height="\d+"/.test(imgMatch[0]), `Expected height attribute, got: ${imgMatch[0]}`);
  });
});

// ── 02-§66.6 — Content images from markdown ────────────────────────────────

describe('02-§66.6 — Content image dimensions from markdown', () => {
  it('DIM-07: getImageDimensions returns dimensions for a test fixture', () => {
    // Uses a tiny 10x10 WebP stored directly in git (not LFS)
    const { getImageDimensions } = require('../source/build/image-dimensions');
    const imgPath = path.join(FIXTURES_DIR, 'test-10x10.webp');
    assert.ok(fs.existsSync(imgPath), `Test fixture must exist: ${imgPath}`);
    const dims = getImageDimensions(imgPath);
    assert.ok(dims, 'Expected dimensions object');
    assert.strictEqual(dims.width, 10, `Expected width=10, got: ${dims.width}`);
    assert.strictEqual(dims.height, 10, `Expected height=10, got: ${dims.height}`);
  });

  it('DIM-08: getImageDimensions returns null for non-existent file', () => {
    const { getImageDimensions } = require('../source/build/image-dimensions');
    const dims = getImageDimensions('/no/such/image.webp');
    assert.strictEqual(dims, null, 'Expected null for missing file');
  });
});

// ── 02-§66.7 — Location/facility images ────────────────────────────────────

describe('02-§66.7 — Location image dimensions', () => {
  it('DIM-09: location images have width and height attributes', () => {
    // Uses test fixture directory so images resolve in CI (not LFS pointers)
    const locations = [{
      id: 'test-loc',
      name: 'Test Location',
      information: 'Info',
      image_path: 'test-10x10.webp',
    }];
    const html = renderLocationAccordions(locations, FIXTURES_DIR);
    const imgMatch = html.match(/<img[^>]*class="content-img"[^>]*>/);
    assert.ok(imgMatch, 'Expected content-img element');
    assert.ok(/width="\d+"/.test(imgMatch[0]), `Expected width attribute, got: ${imgMatch[0]}`);
    assert.ok(/height="\d+"/.test(imgMatch[0]), `Expected height attribute, got: ${imgMatch[0]}`);
  });
});
