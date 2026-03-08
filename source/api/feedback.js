'use strict';

// Feedback validation and GitHub Issue creation.
// Mirrors the injection patterns from validate.js.

const { githubRequest, env } = require('./github');

const VALID_CATEGORIES = ['bug', 'suggestion', 'other'];

const CATEGORY_LABELS = {
  bug:        'feedback:bug',
  suggestion: 'feedback:suggestion',
  other:      'feedback:other',
};

const CATEGORY_DISPLAY = {
  bug:        'Bugg',
  suggestion: 'Förslag',
  other:      'Övrigt',
};

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

// ── Rate-limiting (in-memory) ────────────────────────────────────────────────

const rateMap = new Map();   // ip → { count, resetAt }
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 60 * 60 * 1000; // 1 hour

function isRateLimited(ip) {
  const now = Date.now();
  const entry = rateMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > RATE_LIMIT;
}

// ── Validation ───────────────────────────────────────────────────────────────

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
    return { ok: false, error: 'category måste vara bug, suggestion eller other' };
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

// ── GitHub Issue creation ────────────────────────────────────────────────────

async function createFeedbackIssue(body) {
  const owner = env('GITHUB_OWNER');
  const repo  = env('GITHUB_REPO');
  const token = env('GITHUB_TOKEN');

  const category    = body.category.trim();
  const title       = body.title.trim();
  const description = body.description.trim();
  const name        = typeof body.name === 'string' ? body.name.trim() : '';
  const pageUrl     = typeof body.url  === 'string' ? body.url.trim()  : '';
  const viewport    = typeof body.viewport  === 'string' ? body.viewport  : '';
  const userAgent   = typeof body.userAgent === 'string' ? body.userAgent : '';
  const timestamp   = typeof body.timestamp === 'string' ? body.timestamp : '';

  const issueTitle = `[Feedback] ${CATEGORY_DISPLAY[category]}: ${title}`;
  const issueBody = `${description}

---

| Metadata | Värde |
|----------|-------|
| Kategori | ${CATEGORY_DISPLAY[category]} |
| Sida | ${pageUrl || 'Ej angivet'} |
| Viewport | ${viewport || 'Ej angivet'} |
| Tid | ${timestamp || 'Ej angivet'} |
| Namn/kontakt | ${name || 'Ej angivet'} |
| User-Agent | ${userAgent || 'Ej angivet'} |`;

  const apiPath = `/repos/${owner}/${repo}/issues`;
  const { data } = await githubRequest('POST', apiPath, {
    title:  issueTitle,
    body:   issueBody,
    labels: [CATEGORY_LABELS[category]],
  }, token);

  return data.html_url;
}

module.exports = { validateFeedbackRequest, createFeedbackIssue, isRateLimited };
