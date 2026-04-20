'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const contentDir = path.join(__dirname, '..', 'source', 'content');
const registrationMd = fs.readFileSync(path.join(contentDir, 'registration.md'), 'utf8');
const pricingMd = fs.readFileSync(path.join(contentDir, 'pricing.md'), 'utf8');
const rulesMd = fs.readFileSync(path.join(contentDir, 'rules.md'), 'utf8');

// ── 02-§3.6  Registration section links to the external registration service ─

describe('02-§3.6 — Registration section links to external service', () => {
  it('REG-01: registration.md contains a link to event-friend-ai.lovable.app', () => {
    assert.ok(
      registrationMd.includes('event-friend-ai.lovable.app'),
      'registration.md must link to the external registration service',
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
