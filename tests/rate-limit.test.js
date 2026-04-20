'use strict';

// Tests for the shared rate-limit helper — 02-§93.7.
//
// The helper is consumed by app.js (three new handlers plus the existing
// /feedback handler). End-to-end handler integration is covered by the
// implementation itself; these tests exercise the pure counter logic.

const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert/strict');

const { isRateLimited, _reset } = require('../source/api/rate-limit');

describe('isRateLimited — counter behavior (02-§93.7)', () => {
  beforeEach(() => _reset());

  it('RL-01: first request for a fresh key is not limited', () => {
    assert.strictEqual(
      isRateLimited('verify-admin:1.2.3.4', { limit: 5, windowMs: 60_000 }),
      false,
    );
  });

  it('RL-02: requests up to the limit are not limited', () => {
    const cfg = { limit: 5, windowMs: 60_000 };
    for (let i = 1; i <= 5; i += 1) {
      assert.strictEqual(
        isRateLimited('verify-admin:a', cfg),
        false,
        `call #${i} should not be limited (limit=5)`,
      );
    }
  });

  it('RL-03: the first request past the limit returns true', () => {
    const cfg = { limit: 5, windowMs: 60_000 };
    for (let i = 0; i < 5; i += 1) isRateLimited('verify-admin:b', cfg);
    assert.strictEqual(isRateLimited('verify-admin:b', cfg), true);
  });

  it('RL-04: different keys have independent quotas', () => {
    const cfg = { limit: 1, windowMs: 60_000 };
    assert.strictEqual(isRateLimited('verify-admin:c', cfg), false);
    assert.strictEqual(isRateLimited('verify-admin:c', cfg), true);
    // Same IP, different namespace — independent quota.
    assert.strictEqual(isRateLimited('edit-event:c', cfg), false);
    // Different IP, same namespace — independent quota.
    assert.strictEqual(isRateLimited('verify-admin:d', cfg), false);
  });

  it('RL-05: entries expire after the window elapses', async () => {
    const cfg = { limit: 1, windowMs: 20 };
    assert.strictEqual(isRateLimited('ns:e', cfg), false);
    assert.strictEqual(isRateLimited('ns:e', cfg), true);
    await new Promise((resolve) => setTimeout(resolve, 30));
    assert.strictEqual(
      isRateLimited('ns:e', cfg),
      false,
      'a fresh window should reset the counter',
    );
  });
});
