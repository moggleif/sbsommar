'use strict';

// ── Form time-gating (02-§26.10, 02-§26.11) ─────────────────────────────────
//
// The submission period for a camp runs from `opens_for_editing` through
// `end_date + 1 day` (inclusive on both ends).
//
// All comparisons are plain YYYY-MM-DD string comparisons — no timezone
// handling.  This matches the data contract (05-§4.5).

/**
 * Returns the day after a YYYY-MM-DD date string, as YYYY-MM-DD.
 */
function addOneDay(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d + 1));
  return date.toISOString().slice(0, 10);
}

/**
 * Returns true when `today` is outside the editing period
 * [opens_for_editing, end_date + 1 day].
 *
 * @param {string} today            – YYYY-MM-DD
 * @param {string} opensForEditing  – YYYY-MM-DD
 * @param {string} endDate          – YYYY-MM-DD (camp end_date)
 * @returns {boolean}
 */
function isOutsideEditingPeriod(today, opensForEditing, endDate) {
  const closes = addOneDay(endDate);
  return today < opensForEditing || today > closes;
}

module.exports = { isOutsideEditingPeriod, addOneDay };
