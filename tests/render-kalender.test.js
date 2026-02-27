'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const { renderKalenderPage } = require('../source/build/render-kalender');

// ── Fixtures ────────────────────────────────────────────────────────────────

const camp = {
  id: '2026-06-syssleback',
  name: 'SB Sommar Juni 2026',
  location: 'Sysslebäck',
  start_date: '2026-06-28',
  end_date: '2026-07-05',
};

const siteUrl = 'https://sommar.digitalasynctransparency.com';

// ── Tests ───────────────────────────────────────────────────────────────────

describe('renderKalenderPage (02-§45.15–45.19)', () => {
  it('KAL-01 (02-§45.15): page exists and is valid HTML', () => {
    const html = renderKalenderPage(camp, siteUrl);
    assert.ok(html.startsWith('<!DOCTYPE html>'), 'should start with doctype');
    assert.ok(html.includes('lang="sv"'), 'should have lang="sv"');
  });

  it('KAL-02 (02-§45.16): page mentions iOS', () => {
    const html = renderKalenderPage(camp, siteUrl);
    assert.ok(html.includes('iOS') || html.includes('iPhone'), 'should mention iOS or iPhone');
  });

  it('KAL-03 (02-§45.16): page mentions Android', () => {
    const html = renderKalenderPage(camp, siteUrl);
    assert.ok(html.includes('Android'), 'should mention Android');
  });

  it('KAL-04 (02-§45.16): page mentions Gmail', () => {
    const html = renderKalenderPage(camp, siteUrl);
    assert.ok(html.includes('Gmail'), 'should mention Gmail');
  });

  it('KAL-05 (02-§45.16): page mentions Outlook', () => {
    const html = renderKalenderPage(camp, siteUrl);
    assert.ok(html.includes('Outlook'), 'should mention Outlook');
  });

  it('KAL-06 (02-§45.17): page explains subscription vs download', () => {
    const html = renderKalenderPage(camp, siteUrl);
    assert.ok(html.includes('prenumer') || html.includes('Prenumer'), 'should mention subscription');
  });

  it('KAL-07 (02-§45.18): page content is in Swedish', () => {
    const html = renderKalenderPage(camp, siteUrl);
    assert.ok(html.includes('Kalender'), 'should have Swedish heading');
  });

  it('KAL-08 (02-§45.19): page includes shared navigation', () => {
    const html = renderKalenderPage(camp, siteUrl);
    assert.ok(html.includes('class="page-nav"'), 'should have page-nav');
  });

  it('KAL-09 (02-§45.19): page includes footer when provided', () => {
    const html = renderKalenderPage(camp, siteUrl, '<p>Footer</p>');
    assert.ok(html.includes('class="site-footer"'), 'should have site-footer');
    assert.ok(html.includes('Footer'), 'should include footer content');
  });

  it('KAL-10: page includes meta robots noindex nofollow', () => {
    const html = renderKalenderPage(camp, siteUrl);
    assert.ok(html.includes('<meta name="robots" content="noindex, nofollow">'), 'should have robots meta');
  });

  it('KAL-11: page includes webcal URL for the camp', () => {
    const html = renderKalenderPage(camp, siteUrl);
    assert.ok(html.includes('webcal://'), 'should include webcal:// link');
  });

  it('KAL-12: page includes link to schema.ics', () => {
    const html = renderKalenderPage(camp, siteUrl);
    assert.ok(html.includes('schema.ics'), 'should reference schema.ics');
  });
});
