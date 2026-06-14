'use strict';

// Location availability filtering (02-§107).
//
// Each location entry in source/data/local.yaml may carry an optional boolean
// `active` field. A location is available when `active` is true or absent, and
// unavailable when `active` is explicitly false. This lets an administrator
// hide a location the camp has no access to in a given year (for example the
// school or the youth centre) by flipping one line, without deleting the entry.
//
// build.js applies this filter once, right after loading local.yaml, so every
// downstream consumer (the add/edit form dropdowns, the Lokaler schedule grid,
// and the homepage location accordions) reads the same filtered list.

function filterAvailableLocations(locations) {
  if (!Array.isArray(locations)) return [];
  return locations.filter((l) => l.active !== false);
}

module.exports = { filterAvailableLocations };
