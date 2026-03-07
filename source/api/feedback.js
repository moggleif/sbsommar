'use strict';

// Feedback validation — mirrors the injection patterns from validate.js.

const VALID_CATEGORIES = ['bug', 'suggestion', 'question'];

const MAX_LENGTHS = {
  title:       200,
  description: 2000,
  name:        200,
};

const TEXT_FIELDS = ['title', 'description', 'name'];

const INJECTION_PATTERNS = [
  { re: /<script/i,         label: '<script>' },
  { re: /javascript:/i,     label: 'javascript: URI' },
  { re: /on\w+\s*=/i,       label: 'event handler (on*=)' },
  { re: /<iframe/i,         label: '<iframe>' },
  { re: /<object/i,         label: '<object>' },
  { re: /<embed/i,          label: '<embed>' },
  { re: /data:text\/html/i, label: 'data:text/html URI' },
];

function validateFeedbackRequest(body) {
  if (!body || typeof body !== 'object') {
    return { ok: false, error: 'Invalid request body' };
  }

  // Honeypot check — return ok but flag it
  const website = typeof body.website === 'string' ? body.website.trim() : '';
  if (website) {
    return { ok: true, honeypot: true };
  }

  const category    = typeof body.category    === 'string' ? body.category.trim()    : '';
  const title       = typeof body.title       === 'string' ? body.title.trim()       : '';
  const description = typeof body.description === 'string' ? body.description.trim() : '';
  const name        = typeof body.name        === 'string' ? body.name.trim()        : '';

  if (!category || !VALID_CATEGORIES.includes(category)) {
    return { ok: false, error: 'category måste vara bug, suggestion eller question' };
  }
  if (!title) return { ok: false, error: 'title är obligatoriskt' };
  if (!description) return { ok: false, error: 'description är obligatoriskt' };

  // Length limits
  if (title.length > MAX_LENGTHS.title) {
    return { ok: false, error: `title överskrider maxlängd ${MAX_LENGTHS.title} tecken` };
  }
  if (description.length > MAX_LENGTHS.description) {
    return { ok: false, error: `description överskrider maxlängd ${MAX_LENGTHS.description} tecken` };
  }
  if (name.length > MAX_LENGTHS.name) {
    return { ok: false, error: `name överskrider maxlängd ${MAX_LENGTHS.name} tecken` };
  }

  // Injection scan
  for (const field of TEXT_FIELDS) {
    const val = typeof body[field] === 'string' ? body[field] : '';
    if (!val) continue;
    for (const { re, label } of INJECTION_PATTERNS) {
      if (re.test(val)) {
        return { ok: false, error: `${field} innehåller otillåtet mönster: ${label}` };
      }
    }
  }

  return { ok: true };
}

module.exports = { validateFeedbackRequest };
