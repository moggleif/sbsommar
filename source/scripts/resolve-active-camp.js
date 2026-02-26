'use strict';

// Derives the active camp from dates. Shared by build.js and the API.
//
// Priority:
//   1. On dates — today falls within start_date..end_date (inclusive)
//   2. Next upcoming — nearest future start_date
//   3. Most recent — latest end_date (even if archived)
//
// If two camps overlap, the one with the earlier start_date wins.
//
// Environment-aware filtering (02-§42.22–42.25):
//   - 'production': camps with qa: true are excluded before resolution.
//   - 'qa': qa: true camps on dates take priority over non-QA camps.
//   - undefined/other: no filtering, original behaviour.
//
// Usage:
//   const { resolveActiveCamp } = require('./resolve-active-camp');
//   const camp = resolveActiveCamp(campsArray, '2026-06-03', 'production');
//   // If today is omitted, uses the current date.
//   // If environment is omitted, no filtering is applied.

function resolveActiveCamp(camps, today, environment) {
  if (!camps || camps.length === 0) {
    throw new Error('No camps found in camps.yaml');
  }

  const todayStr = today || new Date().toISOString().slice(0, 10);

  // ── Environment filtering (02-§42.22) ───────────────────────────────────
  let pool = camps;

  if (environment === 'production') {
    // Production: exclude QA camps (02-§42.23)
    pool = camps.filter((c) => !c.qa);
    if (pool.length === 0) {
      throw new Error('No camps found in camps.yaml');
    }
  } else if (environment === 'qa') {
    // QA: if a qa: true camp is on dates, it wins immediately (02-§42.24)
    const qaOnDates = camps
      .filter((c) => c.qa === true && String(c.start_date) <= todayStr && todayStr <= String(c.end_date));
    if (qaOnDates.length > 0) {
      return qaOnDates[0];
    }
    // Otherwise fall through to normal resolution with all camps
  }

  // 1. On dates — today within start_date..end_date (inclusive)
  const onDates = pool
    .filter((c) => String(c.start_date) <= todayStr && todayStr <= String(c.end_date))
    .sort((a, b) => String(a.start_date).localeCompare(String(b.start_date)));

  if (onDates.length > 0) {
    return onDates[0];
  }

  // 2. Next upcoming — nearest future start_date
  const upcoming = pool
    .filter((c) => String(c.start_date) > todayStr)
    .sort((a, b) => String(a.start_date).localeCompare(String(b.start_date)));

  if (upcoming.length > 0) {
    return upcoming[0];
  }

  // 3. Most recent — latest end_date
  const sorted = [...pool].sort((a, b) =>
    String(b.end_date).localeCompare(String(a.end_date)),
  );

  return sorted[0];
}

module.exports = { resolveActiveCamp };
