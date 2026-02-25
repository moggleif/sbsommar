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
// Usage:
//   const { resolveActiveCamp } = require('./resolve-active-camp');
//   const camp = resolveActiveCamp(campsArray, '2026-06-03');
//   // If today is omitted, uses the current date.

function resolveActiveCamp(camps, today) {
  if (!camps || camps.length === 0) {
    throw new Error('No camps found in camps.yaml');
  }

  const todayStr = today || new Date().toISOString().slice(0, 10);

  // 1. On dates — today within start_date..end_date (inclusive)
  const onDates = camps
    .filter((c) => String(c.start_date) <= todayStr && todayStr <= String(c.end_date))
    .sort((a, b) => String(a.start_date).localeCompare(String(b.start_date)));

  if (onDates.length > 0) {
    return onDates[0];
  }

  // 2. Next upcoming — nearest future start_date
  const upcoming = camps
    .filter((c) => String(c.start_date) > todayStr)
    .sort((a, b) => String(a.start_date).localeCompare(String(b.start_date)));

  if (upcoming.length > 0) {
    return upcoming[0];
  }

  // 3. Most recent — latest end_date
  const sorted = [...camps].sort((a, b) =>
    String(b.end_date).localeCompare(String(a.end_date)),
  );

  return sorted[0];
}

module.exports = { resolveActiveCamp };
