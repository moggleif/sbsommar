'use strict';

const express = require('express');
const fs      = require('fs');
const path    = require('path');
const yaml    = require('js-yaml');

const { addEventToActiveCamp, updateEventInActiveCamp, slugify } = require('./source/api/github');
const { validateEventRequest, validateEditRequest }              = require('./source/api/validate');
const { isEventPast }                                            = require('./source/api/edit-event');
const { parseSessionIds, buildSetCookieHeader, mergeIds }        = require('./source/api/session');
const { isOutsideEditingPeriod }                                 = require('./source/api/time-gate');
const { resolveActiveCamp }                                      = require('./source/scripts/resolve-active-camp');

const app = express();

// ── Load active camp metadata for time-gating ───────────────────────────────

const campsPath = path.join(__dirname, 'source', 'data', 'camps.yaml');
const campsData = yaml.load(fs.readFileSync(campsPath, 'utf8'));
const activeCamp = resolveActiveCamp(campsData.camps || []);

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

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'API running' });
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

// Static LAST
app.use(express.static(path.join(__dirname, 'public')));

// ── Start ────────────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`SB Sommar → http://localhost:${PORT}`);
});

module.exports = app;
