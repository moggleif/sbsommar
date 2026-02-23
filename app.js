'use strict';

const express = require('express');
const path    = require('path');

const { addEventToActiveCamp } = require('./source/api/github');
const { validateEventRequest } = require('./source/api/validate');

const app = express();

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
  }
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// ── Routes ───────────────────────────────────────────────────────────────────

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'API running' });
});

app.post('/add-event', async (req, res) => {
  const v = validateEventRequest(req.body);
  if (!v.ok) {
    return res.status(400).json({ success: false, error: v.error });
  }

  try {
    await addEventToActiveCamp(req.body);
    return res.json({ success: true });
  } catch (err) {
    console.error('POST /add-event error:', err.message);
    return res.status(500).json({ success: false, error: err.message });
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
