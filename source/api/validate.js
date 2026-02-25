'use strict';

function isDatePast(dateStr) {
  const today = new Date().toISOString().slice(0, 10);
  return dateStr < today;
}

// Mirrors the validation in the legacy events.js handler.
// Returns { ok: true } on success or { ok: false, error: string } on failure.
function validateEventRequest(body) {
  if (!body || typeof body !== 'object') {
    return fail('Invalid request body');
  }

  const title       = typeof body.title       === 'string' ? body.title.trim()       : '';
  const date        = typeof body.date        === 'string' ? body.date.trim()        : '';
  const start       = typeof body.start       === 'string' ? body.start.trim()       : '';
  const end         = typeof body.end         === 'string' ? body.end.trim()         : '';
  const location    = typeof body.location    === 'string' ? body.location.trim()    : '';
  const responsible = typeof body.responsible === 'string' ? body.responsible.trim() : '';

  if (!title)       return fail('title är obligatoriskt');
  if (!date)        return fail('date är obligatoriskt');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return fail('date måste vara YYYY-MM-DD');
  if (isNaN(new Date(date).getTime())) return fail('date är inte ett giltigt datum');
  if (isDatePast(date))               return fail('Datum kan inte vara i det förflutna.');
  if (!start)       return fail('start är obligatoriskt');
  if (!end)         return fail('end är obligatoriskt');
  if (end <= start) return fail('end måste vara efter start');
  if (!location)    return fail('location är obligatoriskt');
  if (!responsible) return fail('responsible är obligatoriskt');

  if (body.description !== undefined && typeof body.description !== 'string') {
    return fail('description måste vara en sträng');
  }
  if (body.link !== undefined && typeof body.link !== 'string') {
    return fail('link måste vara en sträng');
  }
  if (body.ownerName !== undefined && typeof body.ownerName !== 'string') {
    return fail('ownerName måste vara en sträng');
  }

  return { ok: true };
}

// Validate an edit request body.  Same rules as validateEventRequest but:
// - id is required (the stable event identifier being edited)
function validateEditRequest(body) {
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

  if (!id)          return fail('id är obligatoriskt');
  if (!title)       return fail('title är obligatoriskt');
  if (!date)        return fail('date är obligatoriskt');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return fail('date måste vara YYYY-MM-DD');
  if (isNaN(new Date(date).getTime())) return fail('date är inte ett giltigt datum');
  if (isDatePast(date))               return fail('Datum kan inte vara i det förflutna.');
  if (!start)       return fail('start är obligatoriskt');
  if (!end)         return fail('end är obligatoriskt');
  if (end <= start) return fail('end måste vara efter start');
  if (!location)    return fail('location är obligatoriskt');
  if (!responsible) return fail('responsible är obligatoriskt');

  if (body.description !== undefined && typeof body.description !== 'string') {
    return fail('description måste vara en sträng');
  }
  if (body.link !== undefined && typeof body.link !== 'string') {
    return fail('link måste vara en sträng');
  }

  return { ok: true };
}

function fail(error) {
  return { ok: false, error };
}

module.exports = { validateEventRequest, validateEditRequest };
