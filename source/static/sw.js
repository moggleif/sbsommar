// Service worker for SB Sommar PWA.
// Provides offline caching: network-first for HTML and events.json,
// cache-first for static assets (CSS, JS, images).

const CACHE_NAME = 'sb-sommar-v2';

// Pages and assets to pre-cache on install.
const PRE_CACHE_URLS = [
  '/',
  '/schema.html',
  '/idag.html',
  '/lagg-till.html',
  '/redigera.html',
  '/live.html',
  '/arkiv.html',
  '/kalender.html',
  '/offline.html',
  '/style.css',
  '/app.webmanifest',
];

// Paths that must never be cached (always fetched from network).
const NO_CACHE_PATTERNS = [
  '/add-event',
  '/edit-event',
  '/verify-admin',
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

  // Ignore non-HTTP(S) schemes (e.g. chrome-extension://).
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;

  // Never cache API calls or form submissions.
  if (NO_CACHE_PATTERNS.some((p) => url.pathname.includes(p))) return;

  // events.json: network-first so offline still shows schedule data.
  if (url.pathname.endsWith('events.json')) {
    event.respondWith(networkFirstThenCache(request));
    return;
  }

  // Navigation requests (HTML): network-first, offline fallback page.
  if (request.mode === 'navigate' || request.destination === 'document') {
    event.respondWith(networkFirstWithOfflineFallback(request));
    return;
  }

  // Static assets (CSS, JS, images): cache-first, network fallback.
  event.respondWith(cacheFirstThenNetwork(request));
});

// ── Strategy helpers ────────────────────────────────────────────────────────

async function networkFirstThenCache(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    return cached || new Response('Offline', { status: 503, statusText: 'Offline' });
  }
}

async function networkFirstWithOfflineFallback(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    // Try the specific page from cache first.
    const cached = await caches.match(request);
    if (cached) return cached;
    // Fall back to the offline page.
    const offline = await caches.match('/offline.html');
    return offline || new Response('Offline', { status: 503, statusText: 'Offline' });
  }
}

async function cacheFirstThenNetwork(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('Offline', { status: 503, statusText: 'Offline' });
  }
}
