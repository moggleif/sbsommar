'use strict';

const crypto = require('crypto');

// ── parseAdminTokens ────────────────────────────────────────────────────────

// Parse the ADMIN_TOKENS environment variable (comma-separated string)
// into an array of non-empty trimmed strings.
function parseAdminTokens(raw) {
  if (!raw || typeof raw !== 'string') return [];
  return raw.split(',').map((s) => s.trim()).filter(Boolean);
}

// ── Token expiry ────────────────────────────────────────────────────────────

// Extract the Unix epoch (seconds) from the last segment of a token.
// Token format: namn_uuid_epoch — e.g. "erik_e0d6229c-...-xxxx_1752710400"
// Returns the epoch as a number, or 0 if the token has no valid epoch suffix.
function extractTokenExpiry(token) {
  if (!token || typeof token !== 'string') return 0;
  const lastUnderscore = token.lastIndexOf('_');
  if (lastUnderscore === -1) return 0;
  const epoch = Number(token.slice(lastUnderscore + 1));
  return Number.isFinite(epoch) && epoch > 0 ? epoch : 0;
}

// Check if a token's embedded expiry has passed.
// Returns true (= expired) when: no epoch found, or epoch is in the past.
function isTokenExpired(token) {
  const expiry = extractTokenExpiry(token);
  if (expiry === 0) return true;
  return Math.floor(Date.now() / 1000) > expiry;
}

// ── verifyAdminToken ────────────────────────────────────────────────────────

// Check if a candidate token matches any entry in the valid tokens list.
// Uses constant-time comparison to prevent timing attacks (02-§91.8).
// Rejects tokens whose embedded expiry epoch has passed.
function verifyAdminToken(candidate, validTokens) {
  if (!candidate || typeof candidate !== 'string' || !Array.isArray(validTokens)) return false;

  // Check embedded expiry before comparing
  if (isTokenExpired(candidate)) return false;

  for (const valid of validTokens) {
    if (candidate.length === valid.length &&
        crypto.timingSafeEqual(Buffer.from(candidate), Buffer.from(valid))) {
      return true;
    }
  }
  return false;
}

module.exports = { parseAdminTokens, verifyAdminToken, isTokenExpired, extractTokenExpiry };
