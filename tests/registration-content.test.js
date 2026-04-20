'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const { renderIndexPage } = require('../source/build/render-index');

const contentDir = path.join(__dirname, '..', 'source', 'content');
const pricingMd = fs.readFileSync(path.join(contentDir, 'pricing.md'), 'utf8');
const rulesMd = fs.readFileSync(path.join(contentDir, 'rules.md'), 'utf8');

// ── 02-§3.6  Registration section links to the external registration service ─

describe('02-§3.6 — Registration section links to external service', () => {
  it('REG-01: rendered anmalan section links to event-friend-ai.lovable.app', () => {
    const html = renderIndexPage({
      heroSrc: 'images/k.webp',
      heroAlt: '',
      sections: [{ id: 'anmalan', navLabel: 'Anmälan', html: '<p>Text</p>' }],
      discordUrl: null,
      facebookUrl: null,
      countdownTarget: null,
      registrationCamps: [],
    });
    const anmalanMatch = html.match(/<section id="anmalan"[\s\S]*?<\/section>/);
    assert.ok(anmalanMatch, 'Expected anmalan section in rendered output');
    assert.ok(
      anmalanMatch[0].includes('event-friend-ai.lovable.app'),
      'Rendered anmalan section must link to the external registration service',
    );
  });
});

// ── 02-§3.7  Cancellation tiers and right to refuse documented ──────────────

describe('02-§3.7 — Participation terms documented on the site', () => {
  const combined = `${pricingMd}\n${rulesMd}`;

  it('REG-02: 14-day refund tier (100%) is documented', () => {
    assert.ok(
      /14 dagar/i.test(combined) && /100\s*%/.test(combined),
      'Site must document the >14-day full-refund tier',
    );
  });

  it('REG-03: 7-day partial refund tier (50%) is documented', () => {
    assert.ok(
      /7[–-]13 dagar/i.test(combined) && /50\s*%/.test(combined),
      'Site must document the 7–13-day 50%-refund tier',
    );
  });

  it('REG-04: under-7-days no-refund tier is documented', () => {
    assert.ok(
      /7 dagar/i.test(combined) && /ingen återbetalning/i.test(combined),
      'Site must document the <7-day no-refund tier',
    );
  });

  it("REG-05: organiser's right to refuse is documented", () => {
    assert.ok(
      /neka|förbehåller sig rätten/i.test(combined),
      "Site must document the organiser's right to refuse participation",
    );
  });
});
