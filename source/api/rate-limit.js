'use strict';

// Shared rate-limit helper — 02-§93.7.
//
// Keeps a per-key counter with a fixed expiry window. Callers build
// the key so different endpoints and IPs get independent quotas,
// typically as "{namespace}:{ip}".
//
// State is held in this module's closure, so the counter is process-local
// and resets on restart. PHP has a file-based equivalent in
// api/src/RateLimit.php — see docs/03-ARCHITECTURE.md §31.

const rateMap = new Map(); // key → { count: number, resetAt: number }

/**
 * Return true when the caller should reject the request (429). Each call
 * counts as one request; callers should invoke this once per incoming
 * request, before any other work.
 *
 * @param {string} key — "{namespace}:{ip}" composite
 * @param {{ limit: number, windowMs: number }} config
 * @returns {boolean}
 */
function isRateLimited(key, { limit, windowMs }) {
  const now = Date.now();
  const entry = rateMap.get(key);
  if (!entry || now > entry.resetAt) {
    rateMap.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }
  entry.count += 1;
  return entry.count > limit;
}

// Test-only: clear all counters. Not part of the stable API.
function _reset() {
  rateMap.clear();
}

module.exports = { isRateLimited, _reset };
