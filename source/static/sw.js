// Service worker for SB Sommar PWA.
// Provides basic offline caching with a network-first strategy for HTML
// and cache-first for static assets (CSS, JS, images).

const CACHE_NAME = 'sb-sommar-v1';

// Core pages and assets to pre-cache on install.
const PRE_CACHE_URLS = [
  '/',
  '/schema.html',
  '/idag.html',
  '/style.css',
  '/app.webmanifest',
];

// Paths that must never be cached (always fetched from network).
const NO_CACHE_PATTERNS = [
  'events.json',
  '/add-event',
  '/edit-event',
  '/api/',
];

// ── Install: pre-cache core pages ───────────────────────────────────────────

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRE_CACHE_URLS)),
  );
});

// ── Activate: remove old caches ─────────────────────────────────────────────

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key)),
      ),
    ),
  );
});

// ── Fetch: route requests to network or cache ───────────────────────────────

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only handle GET requests.
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Never cache API calls or event data.
  if (NO_CACHE_PATTERNS.some((p) => url.pathname.includes(p))) return;

  // Navigation requests (HTML): network-first, cache fallback.
  if (request.mode === 'navigate' || request.destination === 'document') {
    event.respondWith(networkFirstThenCache(request));
    return;
  }

  // Static assets (CSS, JS, images): cache-first, network fallback.
  event.respondWith(cacheFirstThenNetwork(request));
});

// ── Strategy helpers ────────────────────────────────────────────────────────

async function networkFirstThenCache(request) {
  try {
    const response = await fetch(request);
    // Cache a copy of the successful response.
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    // Network unavailable — serve from cache if available.
    const cached = await caches.match(request);
    return cached || new Response('Offline', { status: 503, statusText: 'Offline' });
  }
}

async function cacheFirstThenNetwork(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    // Cache the response for next time.
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('Offline', { status: 503, statusText: 'Offline' });
  }
}
