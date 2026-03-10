'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const { renderSchedulePage } = require('../source/build/render');
const { renderAddPage } = require('../source/build/render-add');
const { renderEditPage } = require('../source/build/render-edit');
const { renderIdagPage } = require('../source/build/render-idag');
const { renderTodayPage } = require('../source/build/render-today');
const { renderIndexPage } = require('../source/build/render-index');
const { renderArkivPage } = require('../source/build/render-arkiv');
const { renderKalenderPage } = require('../source/build/render-kalender');

// ── Shared fixtures ─────────────────────────────────────────────────────────

const CAMP = {
  name: 'SB sommar 2099',
  location: 'Sysslebäck',
  start_date: '2099-07-01',
  end_date: '2099-07-07',
  opens_for_editing: '2099-06-15',
};

const EVENTS = [
  { id: 'e1', title: 'Frukost', date: '2099-07-01', start: '08:00', end: '09:00', location: 'Servicehus', responsible: 'Anna' },
];

const LOCATIONS = ['Servicehus', 'Annat'];
const QR_SVG = '<svg><rect/></svg>';

const INDEX_PAGE = {
  heroSrc: 'images/hero.jpg',
  heroAlt: 'Camp view',
  discordUrl: null,
  facebookUrl: null,
  countdownTarget: null,
  sections: [{ id: 'start', navLabel: 'Start', html: '<p>Intro</p>' }],
};

// ── Helper: render all pages ────────────────────────────────────────────────

const ALL_PAGES = [
  ['schedule', () => renderSchedulePage(CAMP, EVENTS)],
  ['add-activity', () => renderAddPage(CAMP, LOCATIONS, '/add-event')],
  ['edit-activity', () => renderEditPage(CAMP, LOCATIONS, '/edit-event')],
  ['idag', () => renderIdagPage(CAMP, EVENTS)],
  ['display', () => renderTodayPage(CAMP, EVENTS, QR_SVG)],
  ['index', () => renderIndexPage(INDEX_PAGE)],
  ['arkiv', () => renderArkivPage([])],
  ['kalender', () => renderKalenderPage(CAMP, 'https://example.com')],
];

// ── 02-§83.8 — Every page includes <link rel="manifest"> ───────────────────

describe('02-§83.8 — Every page includes manifest link', () => {
  for (const [name, fn] of ALL_PAGES) {
    it(`PWA-01-${name}: ${name} page includes <link rel="manifest">`, () => {
      const html = fn();
      assert.ok(
        html.includes('rel="manifest"') && html.includes('app.webmanifest'),
        `${name} must link to app.webmanifest`,
      );
    });
  }
});

// ── 02-§83.9 — Every page includes <meta name="theme-color"> ───────────────

describe('02-§83.9 — Every page includes theme-color meta', () => {
  for (const [name, fn] of ALL_PAGES) {
    it(`PWA-02-${name}: ${name} page includes <meta name="theme-color">`, () => {
      const html = fn();
      assert.ok(
        html.includes('name="theme-color"'),
        `${name} must have theme-color meta tag`,
      );
    });
  }
});

// ── 02-§83.10 — Every page includes apple-mobile-web-app-capable ────────────

describe('02-§83.10 — Every page includes apple-mobile-web-app-capable', () => {
  for (const [name, fn] of ALL_PAGES) {
    it(`PWA-03-${name}: ${name} page includes apple-mobile-web-app-capable`, () => {
      const html = fn();
      assert.ok(
        html.includes('name="apple-mobile-web-app-capable"'),
        `${name} must have apple-mobile-web-app-capable`,
      );
    });
  }
});

// ── 02-§83.11 — Every page includes apple-mobile-web-app-status-bar-style ──

describe('02-§83.11 — Every page includes apple-mobile-web-app-status-bar-style', () => {
  for (const [name, fn] of ALL_PAGES) {
    it(`PWA-04-${name}: ${name} page includes apple-mobile-web-app-status-bar-style`, () => {
      const html = fn();
      assert.ok(
        html.includes('name="apple-mobile-web-app-status-bar-style"'),
        `${name} must have apple-mobile-web-app-status-bar-style`,
      );
    });
  }
});

// ── 02-§83.12 — Every page includes apple-touch-icon ────────────────────────

describe('02-§83.12 — Every page includes apple-touch-icon', () => {
  for (const [name, fn] of ALL_PAGES) {
    it(`PWA-05-${name}: ${name} page includes apple-touch-icon`, () => {
      const html = fn();
      assert.ok(
        html.includes('rel="apple-touch-icon"') && html.includes('sbsommar-icon-192.png'),
        `${name} must have apple-touch-icon linking to sbsommar-icon-192.png`,
      );
    });
  }
});

// ── 02-§83.14 — Every page includes sw-register.js ─────────────────────────

describe('02-§83.14 — Every page includes service worker registration script', () => {
  for (const [name, fn] of ALL_PAGES) {
    it(`PWA-06-${name}: ${name} page includes sw-register.js`, () => {
      const html = fn();
      assert.ok(
        html.includes('sw-register.js'),
        `${name} must include sw-register.js`,
      );
    });
  }
});

// ── 02-§83.1 — app.webmanifest exists in source/static ─────────────────────

describe('02-§83.1 — app.webmanifest exists', () => {
  it('PWA-07: source/static/app.webmanifest exists', () => {
    const filePath = path.join(__dirname, '..', 'source', 'static', 'app.webmanifest');
    assert.ok(fs.existsSync(filePath), 'app.webmanifest must exist in source/static/');
  });
});

// ── 02-§83.2 — Manifest name and short_name ────────────────────────────────

describe('02-§83.2 — Manifest name and short_name', () => {
  it('PWA-08: manifest sets name to "SB Sommar"', () => {
    const filePath = path.join(__dirname, '..', 'source', 'static', 'app.webmanifest');
    const manifest = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    assert.equal(manifest.name, 'SB Sommar');
  });

  it('PWA-09: manifest sets short_name to "SB Sommar"', () => {
    const filePath = path.join(__dirname, '..', 'source', 'static', 'app.webmanifest');
    const manifest = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    assert.equal(manifest.short_name, 'SB Sommar');
  });
});

// ── 02-§83.3 — Manifest display standalone ──────────────────────────────────

describe('02-§83.3 — Manifest display standalone', () => {
  it('PWA-10: manifest sets display to "standalone"', () => {
    const filePath = path.join(__dirname, '..', 'source', 'static', 'app.webmanifest');
    const manifest = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    assert.equal(manifest.display, 'standalone');
  });
});

// ── 02-§83.4 — Manifest start_url ──────────────────────────────────────────

describe('02-§83.4 — Manifest start_url', () => {
  it('PWA-11: manifest sets start_url to "/"', () => {
    const filePath = path.join(__dirname, '..', 'source', 'static', 'app.webmanifest');
    const manifest = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    assert.equal(manifest.start_url, '/');
  });
});

// ── 02-§83.5 — Manifest theme_color and background_color ───────────────────

describe('02-§83.5 — Manifest theme_color and background_color', () => {
  it('PWA-12: manifest sets theme_color', () => {
    const filePath = path.join(__dirname, '..', 'source', 'static', 'app.webmanifest');
    const manifest = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    assert.ok(manifest.theme_color, 'theme_color must be set');
  });

  it('PWA-13: manifest sets background_color', () => {
    const filePath = path.join(__dirname, '..', 'source', 'static', 'app.webmanifest');
    const manifest = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    assert.ok(manifest.background_color, 'background_color must be set');
  });
});

// ── 02-§83.6 — Manifest icons 192 and 512 ──────────────────────────────────

describe('02-§83.6 — Manifest declares 192×192 and 512×512 icons', () => {
  it('PWA-14: manifest has 192×192 icon', () => {
    const filePath = path.join(__dirname, '..', 'source', 'static', 'app.webmanifest');
    const manifest = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const icon192 = manifest.icons.find((i) => i.sizes === '192x192');
    assert.ok(icon192, 'manifest must have a 192×192 icon');
    assert.equal(icon192.type, 'image/png');
  });

  it('PWA-15: manifest has 512×512 icon', () => {
    const filePath = path.join(__dirname, '..', 'source', 'static', 'app.webmanifest');
    const manifest = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const icon512 = manifest.icons.find((i) => i.sizes === '512x512');
    assert.ok(icon512, 'manifest must have a 512×512 icon');
    assert.equal(icon512.type, 'image/png');
  });
});

// ── 02-§83.7 — Manifest icons include purpose "any" ────────────────────────

describe('02-§83.7 — Manifest icons include purpose "any"', () => {
  it('PWA-16: at least one icon has purpose "any"', () => {
    const filePath = path.join(__dirname, '..', 'source', 'static', 'app.webmanifest');
    const manifest = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const hasAny = manifest.icons.some((i) => i.purpose === 'any');
    assert.ok(hasAny, 'at least one icon must have purpose "any"');
  });
});

// ── 02-§83.13 — sw.js exists in source/static ──────────────────────────────

describe('02-§83.13 — sw.js exists', () => {
  it('PWA-17: source/static/sw.js exists', () => {
    const filePath = path.join(__dirname, '..', 'source', 'static', 'sw.js');
    assert.ok(fs.existsSync(filePath), 'sw.js must exist in source/static/');
  });
});

// ── 02-§83.15 — Service worker uses versioned cache name ────────────────────

describe('02-§83.15 — Service worker uses versioned cache name', () => {
  it('PWA-18: sw.js contains a versioned CACHE_NAME', () => {
    const filePath = path.join(__dirname, '..', 'source', 'static', 'sw.js');
    const src = fs.readFileSync(filePath, 'utf8');
    assert.ok(src.includes('CACHE_NAME'), 'sw.js must define CACHE_NAME');
    assert.match(src, /sb-sommar-v\d+/, 'CACHE_NAME must follow sb-sommar-vN pattern');
  });
});

// ── 02-§83.16 — Install pre-caches core pages ──────────────────────────────

describe('02-§83.16 — Install pre-caches core pages', () => {
  it('PWA-19: sw.js pre-caches /, schema.html, and idag.html', () => {
    const filePath = path.join(__dirname, '..', 'source', 'static', 'sw.js');
    const src = fs.readFileSync(filePath, 'utf8');
    assert.ok(src.includes("'/'") || src.includes('"/'), 'sw.js must pre-cache /');
    assert.ok(src.includes('schema.html'), 'sw.js must pre-cache schema.html');
    assert.ok(src.includes('idag.html'), 'sw.js must pre-cache idag.html');
  });
});

// ── 02-§83.18 — Activate deletes old caches ────────────────────────────────

describe('02-§83.18 — Activate deletes old caches', () => {
  it('PWA-20: sw.js has activate event that deletes old caches', () => {
    const filePath = path.join(__dirname, '..', 'source', 'static', 'sw.js');
    const src = fs.readFileSync(filePath, 'utf8');
    assert.ok(src.includes('activate'), 'sw.js must handle activate event');
    assert.ok(src.includes('caches.delete') || src.includes('cache.delete'), 'sw.js must delete old caches');
  });
});

// ── 02-§83.19 — Service worker does not cache events.json ───────────────────

describe('02-§83.19 — Service worker does not cache events.json', () => {
  it('PWA-21: sw.js excludes events.json from caching', () => {
    const filePath = path.join(__dirname, '..', 'source', 'static', 'sw.js');
    const src = fs.readFileSync(filePath, 'utf8');
    assert.ok(src.includes('events.json'), 'sw.js must reference events.json (to exclude it)');
  });
});

// ── 02-§83.22 — sw-register.js exists ───────────────────────────────────────

describe('02-§83.22 — sw-register.js exists', () => {
  it('PWA-22: source/assets/js/client/sw-register.js exists', () => {
    const filePath = path.join(__dirname, '..', 'source', 'assets', 'js', 'client', 'sw-register.js');
    assert.ok(fs.existsSync(filePath), 'sw-register.js must exist');
  });
});

// ── 02-§83.25 — Every page uses PWA icon as favicon ─────────────────────────

describe('02-§83.25 — Every page uses PWA icon as favicon', () => {
  for (const [name, fn] of ALL_PAGES) {
    it(`PWA-23-${name}: ${name} page uses sbsommar-icon-192.png as favicon`, () => {
      const html = fn();
      assert.ok(
        html.includes('rel="icon"') && html.includes('sbsommar-icon-192.png'),
        `${name} must use sbsommar-icon-192.png as favicon`,
      );
    });
  }
});
