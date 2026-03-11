'use strict';

const express = require('express');
const fs      = require('fs');
const path    = require('path');
const yaml    = require('js-yaml');

const { addEventToActiveCamp, updateEventInActiveCamp, removeEventFromActiveCamp, slugify } = require('./source/api/github');
const { validateEventRequest, validateEditRequest }              = require('./source/api/validate');
const { isEventPast }                                            = require('./source/api/edit-event');
const { parseSessionIds, buildSetCookieHeader, mergeIds }        = require('./source/api/session');
const { isOutsideEditingPeriod }                                 = require('./source/api/time-gate');
const { validateFeedbackRequest, createFeedbackIssue, isRateLimited } = require('./source/api/feedback');
const { parseAdminTokens, verifyAdminToken }                     = require('./source/api/admin');
const { resolveActiveCamp }                                      = require('./source/scripts/resolve-active-camp');

const app = express();

// ── Load active camp metadata for time-gating ───────────────────────────────

const campsPath = path.join(__dirname, 'source', 'data', 'camps.yaml');
const campsData = yaml.load(fs.readFileSync(campsPath, 'utf8'));
const BUILD_ENV = process.env.BUILD_ENV || undefined;
const activeCamp = resolveActiveCamp(campsData.camps || [], undefined, BUILD_ENV);
const adminTokens = parseAdminTokens(process.env.ADMIN_TOKENS);

// ── Middleware ───────────────────────────────────────────────────────────────

app.use(express.json());

const ALLOWED_ORIGINS = new Set(
  [process.env.ALLOWED_ORIGIN, process.env.QA_ORIGIN].filter(Boolean)
);

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// ── Routes ───────────────────────────────────────────────────────────────────

// Health check (on /api/health so that / serves index.html via express.static)
app.get('/api/health', (req, res) => {
  res.json({ status: 'API running' });
});

// ── Admin token verification (02-§91.4) ─────────────────────────────────────

app.post('/verify-admin', (req, res) => {
  const { token } = req.body || {};
  if (verifyAdminToken(token, adminTokens)) {
    return res.json({ valid: true });
  }
  return res.status(403).json({ valid: false });
});

app.post('/add-event', (req, res) => {
  // Time-gating: reject if outside the editing period.
  if (activeCamp) {
    const today = new Date().toISOString().slice(0, 10);
    if (isOutsideEditingPeriod(today, activeCamp.opens_for_editing, activeCamp.end_date)) {
      return res.status(403).json({ success: false, error: 'Det går inte att lägga till aktiviteter just nu. Formuläret är inte öppet.' });
    }
  }

  const v = validateEventRequest(req.body, activeCamp);
  if (!v.ok) {
    return res.status(400).json({ success: false, error: v.error });
  }

  // Build the event ID the same way github.js does, so we can include it
  // in the session cookie before the GitHub commit completes.
  const title  = String(req.body.title).trim();
  const date   = String(req.body.date).trim();
  const start  = String(req.body.start).trim();
  const eventId = `${slugify(title)}-${date}-${start.replace(':', '')}`;

  // If the client signalled cookie consent, update the session cookie.
  const consentGiven = req.body.cookieConsent === true;
  if (consentGiven) {
    const existing = parseSessionIds(req.headers.cookie || '');
    const updated  = mergeIds(existing, eventId);
    res.setHeader('Set-Cookie', buildSetCookieHeader(updated, process.env.COOKIE_DOMAIN));
  }

  res.json({ success: true, eventId });

  addEventToActiveCamp(req.body).catch((err) => {
    console.error('POST /add-event background error:', err.message);
  });
});

app.post('/edit-event', (req, res) => {
  // Time-gating: reject if outside the editing period.
  if (activeCamp) {
    const today = new Date().toISOString().slice(0, 10);
    if (isOutsideEditingPeriod(today, activeCamp.opens_for_editing, activeCamp.end_date)) {
      return res.status(403).json({ success: false, error: 'Det går inte att redigera aktiviteter just nu. Formuläret är inte öppet.' });
    }
  }

  const v = validateEditRequest(req.body, activeCamp);
  if (!v.ok) {
    return res.status(400).json({ success: false, error: v.error });
  }

  const eventId = String(req.body.id).trim();

  // Verify ownership: event ID must be in the session cookie.
  const ownedIds = parseSessionIds(req.headers.cookie || '');
  if (!ownedIds.includes(eventId)) {
    return res.status(403).json({ success: false, error: 'Ej behörig att redigera denna aktivitet.' });
  }

  // Reject past events.
  if (isEventPast(String(req.body.date).trim())) {
    return res.status(400).json({ success: false, error: 'Aktiviteten har redan ägt rum och kan inte redigeras.' });
  }

  res.json({ success: true });

  updateEventInActiveCamp(eventId, req.body).catch((err) => {
    console.error('POST /edit-event background error:', err.message);
  });
});

app.post('/delete-event', (req, res) => {
  // Time-gating: reject if outside the editing period.
  if (activeCamp) {
    const today = new Date().toISOString().slice(0, 10);
    if (isOutsideEditingPeriod(today, activeCamp.opens_for_editing, activeCamp.end_date)) {
      return res.status(400).json({ success: false, error: 'Det går inte att radera aktiviteter just nu. Formuläret är inte öppet.' });
    }
  }

  const eventId = String(req.body.id || '').trim();
  if (!eventId) {
    return res.status(400).json({ success: false, error: 'Aktivitets-ID saknas.' });
  }

  // Verify ownership: event ID must be in the session cookie.
  const ownedIds = parseSessionIds(req.headers.cookie || '');
  if (!ownedIds.includes(eventId)) {
    return res.status(403).json({ success: false, error: 'Ej behörig att radera denna aktivitet.' });
  }

  // Reject past events.
  if (isEventPast(String(req.body.date || '').trim())) {
    return res.status(400).json({ success: false, error: 'Aktiviteten har redan ägt rum och kan inte raderas.' });
  }

  res.json({ success: true });

  removeEventFromActiveCamp(eventId).catch((err) => {
    console.error('POST /delete-event background error:', err.message);
  });
});

app.post('/feedback', async (req, res) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
  if (isRateLimited(ip)) {
    return res.status(429).json({ success: false, error: 'För många förfrågningar. Försök igen senare.' });
  }

  const v = validateFeedbackRequest(req.body);
  if (!v.ok) {
    return res.status(400).json({ success: false, error: v.error });
  }

  // Honeypot triggered — pretend success
  if (v.honeypot) {
    return res.json({ success: true, issueUrl: '' });
  }

  if (BUILD_ENV !== 'production' && BUILD_ENV !== 'qa') {
    console.log('[feedback dry-run]', JSON.stringify(req.body, null, 2));
    return res.json({ success: true, issueUrl: '' });
  }

  try {
    const issueUrl = await createFeedbackIssue(req.body);
    res.json({ success: true, issueUrl });
  } catch (err) {
    console.error('POST /feedback error:', err.message);
    res.status(500).json({ success: false, error: 'Kunde inte skapa feedback. Försök igen om en stund.' });
  }
});

// Static LAST
app.use(express.static(path.join(__dirname, 'public')));

// ── Start ────────────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`SB Sommar → http://localhost:${PORT}`);
});

module.exports = app;
