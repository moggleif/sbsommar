'use strict';

const COOKIE_NAME    = 'sb_session';
const MAX_AGE_SECONDS = 7 * 24 * 60 * 60; // 7 days

// ── parseSessionIds ───────────────────────────────────────────────────────────

// Parse the sb_session cookie from a raw Cookie header string.
// Returns a (possibly empty) array of event ID strings.
function parseSessionIds(cookieHeader) {
  if (!cookieHeader || typeof cookieHeader !== 'string') return [];

  const pair = cookieHeader
    .split(';')
    .map((s) => s.trim())
    .find((s) => s.startsWith(`${COOKIE_NAME}=`));

  if (!pair) return [];

  const raw = pair.slice(COOKIE_NAME.length + 1);

  try {
    const parsed = JSON.parse(decodeURIComponent(raw));
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id) => typeof id === 'string' && id.length > 0);
  } catch {
    return [];
  }
}

// ── buildSetCookieHeader ──────────────────────────────────────────────────────

// Build the Set-Cookie response header value for the session cookie.
// Pass `domain` (e.g. 'sommar.example.com') when the API and static site
// are on different subdomains; omit it for single-origin deployments.
function buildSetCookieHeader(ids, domain) {
  const value = encodeURIComponent(JSON.stringify(ids));
  const domainPart = domain ? `; Domain=${domain}` : '';
  return `${COOKIE_NAME}=${value}; Path=/; Max-Age=${MAX_AGE_SECONDS}; Secure; SameSite=Strict${domainPart}`;
}

// ── mergeIds ─────────────────────────────────────────────────────────────────

// Return a new array with newId appended to existing, deduplicating.
function mergeIds(existing, newId) {
  if (!Array.isArray(existing)) existing = [];
  if (existing.includes(newId)) return existing;
  return [...existing, newId];
}

module.exports = { COOKIE_NAME, MAX_AGE_SECONDS, parseSessionIds, buildSetCookieHeader, mergeIds };
