'use strict';

// Shared conflict-detection module (02-§99.1–§99.3).
//
// Single source of truth for the overlap predicate. Consumed by
//   • `source/assets/js/client/lagg-till.js` (browser, via global)
//   • `source/assets/js/client/redigera.js`  (browser, via global)
//   • `source/build/render-lokaler.js`       (Node, via require)
//   • `source/build/render-event.js`         (Node, via require)
//   • `tests/conflict-check.test.js`         (Node, via require)
//
// UMD wrapper so the same file serves both CommonJS and a browser global.
// Pure data logic — no DOM, no fetch, no side effects.

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.SBConflictCheck = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  // Effective end time for overlap comparisons. Cross-midnight events
  // (end strictly before start) are treated as ending at 24:00. Events
  // where start === end have zero duration and keep their end as-is so
  // they never overlap anything — matches the Locale Overview rule.
  function effectiveEnd(ev) {
    return ev.end < ev.start ? '24:00' : ev.end;
  }

  // Strict time-interval overlap. Back-to-back events (a.end === b.start)
  // are deliberately NOT a conflict — 02-§99.3.
  function overlaps(a, b) {
    return a.start < effectiveEnd(b) && effectiveEnd(a) > b.start;
  }

  // Mutates: sets `_clash = true` on every event in `events` that overlaps
  // at least one other event in the same array. Callers are expected to
  // have already grouped by date + location before calling.
  // (Lifted from render-lokaler.js so there is one source of truth.)
  function markClashes(events) {
    for (const a of events) {
      for (const b of events) {
        if (a === b) continue;
        if (overlaps(a, b)) {
          a._clash = true;
          break;
        }
      }
    }
  }

  // Returns the subset of `events` that share `candidate`'s date and
  // location and whose times overlap with `candidate`. The event matching
  // `options.excludeId` is skipped (used by the edit form so the event
  // being edited does not clash with itself).
  //
  // Sort order: start time ascending, then title.
  function findConflicts(candidate, events, options) {
    if (!candidate || !candidate.location || !candidate.date) return [];
    const excludeId = options && options.excludeId;
    const out = [];
    for (let i = 0; i < events.length; i++) {
      const ev = events[i];
      if (excludeId && ev.id === excludeId) continue;
      if (ev.date !== candidate.date) continue;
      if (ev.location !== candidate.location) continue;
      if (!overlaps(candidate, ev)) continue;
      out.push(ev);
    }
    out.sort(function (x, y) {
      if (x.start !== y.start) return x.start < y.start ? -1 : 1;
      const xt = x.title || '';
      const yt = y.title || '';
      if (xt !== yt) return xt < yt ? -1 : 1;
      return 0;
    });
    return out;
  }

  // Multi-date candidate (used by lagg-till.js where several dates can be
  // selected at once). `candidate.dates` is an array of ISO dates, or falls
  // back to `[candidate.date]`. Returns a Map keyed by date, containing
  // only the dates that actually have conflicts — `map.size === 0` means
  // no conflicts on any selected date.
  function findConflictsMulti(candidate, events, options) {
    const out = new Map();
    if (!candidate) return out;
    const dates = Array.isArray(candidate.dates)
      ? candidate.dates
      : (candidate.date ? [candidate.date] : []);
    for (let i = 0; i < dates.length; i++) {
      const d = dates[i];
      const conflicts = findConflicts(
        { date: d, start: candidate.start, end: candidate.end, location: candidate.location },
        events,
        options,
      );
      if (conflicts.length > 0) out.set(d, conflicts);
    }
    return out;
  }

  return {
    effectiveEnd: effectiveEnd,
    overlaps: overlaps,
    markClashes: markClashes,
    findConflicts: findConflicts,
    findConflictsMulti: findConflictsMulti,
  };
});
