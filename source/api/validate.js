'use strict';

const TIME_RE = /^\d{2}:\d{2}$/;

const MAX_LENGTHS = {
  title:       200,
  location:    200,
  responsible: 200,
  description: 2000,
  link:        500,
};

function isDatePast(dateStr) {
  const today = new Date().toISOString().slice(0, 10);
  return dateStr < today;
}

// Shared validation logic for both add and edit requests.
// campDates is optional: { start_date, end_date } for range checking.
function validateFields(body, { requireId = false } = {}, campDates) {
  if (!body || typeof body !== 'object') {
    return fail('Invalid request body');
  }

  const id          = typeof body.id          === 'string' ? body.id.trim()          : '';
  const title       = typeof body.title       === 'string' ? body.title.trim()       : '';
  const date        = typeof body.date        === 'string' ? body.date.trim()        : '';
  const start       = typeof body.start       === 'string' ? body.start.trim()       : '';
  const end         = typeof body.end         === 'string' ? body.end.trim()         : '';
  const location    = typeof body.location    === 'string' ? body.location.trim()    : '';
  const responsible = typeof body.responsible === 'string' ? body.responsible.trim() : '';

  if (requireId && !id) return fail('id är obligatoriskt');
  if (!title)       return fail('title är obligatoriskt');
  if (!date)        return fail('date är obligatoriskt');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return fail('date måste vara YYYY-MM-DD');
  if (isNaN(new Date(date).getTime())) return fail('date är inte ett giltigt datum');
  if (isDatePast(date))               return fail('Datum kan inte vara i det förflutna.');

  // Camp date range check (05-§4.1)
  if (campDates && campDates.start_date && campDates.end_date) {
    if (date < campDates.start_date || date > campDates.end_date) {
      return fail(`date ${date} är utanför lägrets datumintervall (${campDates.start_date} – ${campDates.end_date})`);
    }
  }

  if (!start)       return fail('start är obligatoriskt');
  if (!TIME_RE.test(start)) return fail('start måste vara HH:MM');
  if (!end)         return fail('end är obligatoriskt');
  if (!TIME_RE.test(end))   return fail('end måste vara HH:MM');
  if (end <= start) return fail('end måste vara efter start');
  if (!location)    return fail('location är obligatoriskt');
  if (!responsible) return fail('responsible är obligatoriskt');

  // String length limits (02-§10.3)
  if (title.length > MAX_LENGTHS.title) {
    return fail(`title överskrider maxlängd ${MAX_LENGTHS.title} tecken`);
  }
  if (location.length > MAX_LENGTHS.location) {
    return fail(`location överskrider maxlängd ${MAX_LENGTHS.location} tecken`);
  }
  if (responsible.length > MAX_LENGTHS.responsible) {
    return fail(`responsible överskrider maxlängd ${MAX_LENGTHS.responsible} tecken`);
  }

  if (body.description !== undefined && typeof body.description !== 'string') {
    return fail('description måste vara en sträng');
  }
  if (typeof body.description === 'string' && body.description.length > MAX_LENGTHS.description) {
    return fail(`description överskrider maxlängd ${MAX_LENGTHS.description} tecken`);
  }
  if (body.link !== undefined && typeof body.link !== 'string') {
    return fail('link måste vara en sträng');
  }
  if (typeof body.link === 'string' && body.link.length > MAX_LENGTHS.link) {
    return fail(`link överskrider maxlängd ${MAX_LENGTHS.link} tecken`);
  }
  if (body.ownerName !== undefined && typeof body.ownerName !== 'string') {
    return fail('ownerName måste vara en sträng');
  }

  return { ok: true };
}

// Returns { ok: true } on success or { ok: false, error: string } on failure.
// campDates is optional: { start_date, end_date } for range checking (05-§4.1).
function validateEventRequest(body, campDates) {
  return validateFields(body, { requireId: false }, campDates);
}

// Validate an edit request body.  Same rules as validateEventRequest but:
// - id is required (the stable event identifier being edited)
// campDates is optional: { start_date, end_date } for range checking (05-§4.1).
function validateEditRequest(body, campDates) {
  return validateFields(body, { requireId: true }, campDates);
}

function fail(error) {
  return { ok: false, error };
}

module.exports = { validateEventRequest, validateEditRequest };
