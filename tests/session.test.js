'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const { parseSessionIds, buildSetCookieHeader, mergeIds } = require('../source/api/session');

// ── parseSessionIds ───────────────────────────────────────────────────────────

describe('parseSessionIds', () => {
  it('SES-01: returns [] for null cookie header', () => { // SES-01
    assert.deepStrictEqual(parseSessionIds(null), []);
  });

  it('SES-02: returns [] when sb_session cookie is absent', () => { // SES-02
    assert.deepStrictEqual(parseSessionIds('other=value; another=foo'), []);
  });

  it('SES-03: correctly parses a valid sb_session cookie', () => { // SES-03
    const ids = ['event-a', 'event-b'];
    const cookieHeader = `sb_session=${encodeURIComponent(JSON.stringify(ids))}; Path=/`;
    assert.deepStrictEqual(parseSessionIds(cookieHeader), ids);
  });

  it('SES-04: returns [] for malformed JSON in sb_session', () => { // SES-04
    assert.deepStrictEqual(parseSessionIds('sb_session=not-json'), []);
  });

  it('SES-05: filters out non-string and empty-string entries', () => { // SES-05
    const cookieHeader = `sb_session=${encodeURIComponent(JSON.stringify([42, '', 'valid-id', null]))}`;
    assert.deepStrictEqual(parseSessionIds(cookieHeader), ['valid-id']);
  });
});

// ── buildSetCookieHeader ──────────────────────────────────────────────────────

describe('buildSetCookieHeader', () => {
  it('SES-06: includes the cookie name and encoded event IDs', () => { // SES-06
    const header = buildSetCookieHeader(['my-event-id']);
    assert.ok(header.startsWith('sb_session='), `Expected header to start with sb_session=, got: ${header}`);
    assert.ok(header.includes('my-event-id'));
  });

  it('SES-07: includes Max-Age of 604800 (7 days)', () => { // SES-07
    const header = buildSetCookieHeader([]);
    assert.ok(header.includes('Max-Age=604800'), `Missing Max-Age=604800 in: ${header}`);
  });

  it('SES-08: includes the Secure flag', () => { // SES-08
    const header = buildSetCookieHeader([]);
    assert.ok(header.includes('Secure'), `Missing Secure flag in: ${header}`);
  });

  it('SES-09: includes SameSite=Strict', () => { // SES-09
    const header = buildSetCookieHeader([]);
    assert.ok(header.includes('SameSite=Strict'), `Missing SameSite=Strict in: ${header}`);
  });
});

// ── mergeIds ─────────────────────────────────────────────────────────────────

describe('mergeIds', () => {
  it('SES-10: adds a new ID to an existing array', () => { // SES-10
    const result = mergeIds(['a', 'b'], 'c');
    assert.deepStrictEqual(result, ['a', 'b', 'c']);
  });

  it('SES-11: does not duplicate an ID already present', () => { // SES-11
    const result = mergeIds(['a', 'b'], 'a');
    assert.deepStrictEqual(result, ['a', 'b']);
  });

  it('SES-12: handles an empty existing array', () => { // SES-12
    const result = mergeIds([], 'new-event');
    assert.deepStrictEqual(result, ['new-event']);
  });

  it('SES-13: handles a non-array existing value gracefully', () => { // SES-13
    const result = mergeIds(null, 'new-event');
    assert.deepStrictEqual(result, ['new-event']);
  });
});
