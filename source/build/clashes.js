'use strict';

// Flags the later-booked event in each same-location time clash so the schedule
// can mark it (02-§120). A "lokalkrock" is two non-cancelled events on the same
// date, in the same real room, whose times overlap; the one created later (by
// meta.created_at) is the offender and gets `_clash = true`. The earlier booking
// keeps the room and is left unmarked.
//
// The catch-all "Annat" / "[annat]" location is never a real room, so it can
// never be in conflict.

const { overlaps } = require('../assets/js/client/conflict-check.js');

// True when `loc` names a real, bookable room. The catch-all "Annat" (and the
// "[annat]" form shown in the schedule) is excluded — it never clashes.
function isRealLocation(loc) {
  if (!loc) return false;
  const norm = String(loc).trim().toLowerCase().replace(/[[\]]/g, '').trim();
  return norm !== 'annat';
}

// Comparable creation key. Events without a created_at sort first (treated as
// the original booking), so a missing timestamp never marks the legacy event.
function createdKey(e) {
  return e && e.meta && e.meta.created_at ? String(e.meta.created_at) : '';
}

// Sets `_clash = true` on every event that overlaps an EARLIER-created event in
// the same real room on the same date. Cancelled events have freed the room, so
// they neither clash nor cause a clash. Mutates and returns `events`.
function markLocationClashes(events) {
  for (const e of events) {
    if (e.cancelled || !isRealLocation(e.location)) continue;
    const ek = createdKey(e);
    for (const f of events) {
      if (f === e || f.cancelled) continue;
      if (f.date !== e.date || f.location !== e.location) continue;
      if (!overlaps(e, f)) continue;
      // `e` came after `f` (created later) and they share the room — mark `e`.
      if (createdKey(f) < ek) {
        e._clash = true;
        break;
      }
    }
  }
  return events;
}

module.exports = { markLocationClashes, isRealLocation };
