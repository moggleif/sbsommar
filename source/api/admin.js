'use strict';

const crypto = require('crypto');

const ADMIN_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

// ── parseAdminTokens ────────────────────────────────────────────────────────

// Parse the ADMIN_TOKENS environment variable (comma-separated string)
// into an array of non-empty trimmed strings.
function parseAdminTokens(raw) {
  if (!raw || typeof raw !== 'string') return [];
  return raw.split(',').map((s) => s.trim()).filter(Boolean);
}

// ── verifyAdminToken ────────────────────────────────────────────────────────

// Check if a candidate token matches any entry in the valid tokens list.
// Uses constant-time comparison to prevent timing attacks (02-§91.8).
function verifyAdminToken(candidate, validTokens) {
  if (!candidate || typeof candidate !== 'string' || !Array.isArray(validTokens)) return false;

  for (const valid of validTokens) {
    if (candidate.length === valid.length &&
        crypto.timingSafeEqual(Buffer.from(candidate), Buffer.from(valid))) {
      return true;
    }
  }
  return false;
}

// ── isAdminExpired ──────────────────────────────────────────────────────────

// Check if an admin activation timestamp has expired (> 30 days).
// Used client-side and in tests; the server does not track expiry.
function isAdminExpired(activatedMs) {
  if (!activatedMs || typeof activatedMs !== 'number') return true;
  return (Date.now() - activatedMs) > ADMIN_TTL_MS;
}

module.exports = { parseAdminTokens, verifyAdminToken, isAdminExpired, ADMIN_TTL_MS };
