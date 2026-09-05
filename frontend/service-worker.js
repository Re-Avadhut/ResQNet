/* ResQNet service worker.
 *
 * The app must work with the gateway powered off and no internet whatsoever.
 * Strategy per request type:
 *
 *   navigation   -> network first, fall back to the cached shell
 *   static asset -> cache first (they are versioned by CACHE_NAME)
 *   map tile     -> cache first, never fall back to network noise
 *   API GET      -> network first, fall back to the last good response
 *   API mutation -> never cached; the page-level outbox owns retrying those
 *
 * IMPORTANT: bump CACHE_NAME whenever the shell changes, otherwise returning
 * devices keep serving the previous build from cache.
 */

const CACHE_VERSION = 'v2';
const SHELL_CACHE = `resqnet-shell-${CACHE_VERSION}`;
const DATA_CACHE = `resqnet-data-${CACHE_VERSION}`;
const TILE_CACHE = `resqnet-tiles-${CACHE_VERSION}`;

/* App shell. SAME-ORIGIN, MUST-EXIST files only.
 *
 * cache.addAll() is all-or-nothing: one 404 or one opaque cross-origin
 * response rejects the whole install, the worker never activates, and offline
 * support silently dies. That exact bug shipped in the first version of this
 * file. Do not list a path here unless the file really exists. */
const SHELL_ASSETS = [
    '/',
    '/index.html',
    '/manifest.json',
    '/css/tailwind.css',
    '/css/styles.css',
    '/js/app.js',
    '/js/dashboard/dashboard.js',
    '/js/sos/sos.js',
    '/js/missing-persons/missing-persons.js',
    '/js/volunteer/volunteer.js',
    '/js/map/map.js',
    '/vendor/leaflet/leaflet.js',
    '/vendor/leaflet/leaflet.css',
    '/vendor/leaflet/images/marker-icon.png',
    '/vendor/leaflet/images/marker-icon-2x.png',
    '/vendor/leaflet/images/marker-shadow.png',
    '/vendor/leaflet/images/layers.png',
    '/vendor/leaflet/images/layers-2x.png',
    '/assets/icon-192.png',
    '/assets/icon-512.png',
];

/* ── Install ─────────────────────────────────────────────────────────── */

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(SHELL_CACHE).then(async (cache) => {
            /* Added individually rather than with addAll() so that one
               unexpectedly missing file degrades that single asset instead of
               destroying offline support entirely. */
            const results = await Promise.allSettled(
                SHELL_ASSETS.map((url) => cache.add(new Request(url, { cache: 'reload' })))
            );
            const failed = results
                .map((r, i) => (r.status === 'rejected' ? SHELL_ASSETS[i] : null))
                .filter(Boolean);
            if (failed.length) {
                console.warn('[SW] Some shell assets failed to cache:', failed);
            }
        })
    );
    self.skipWaiting();
});

/* ── Activate ────────────────────────────────────────────────────────── */

const CURRENT_CACHES = [SHELL_CACHE, DATA_CACHE, TILE_CACHE];

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((names) => Promise.all(
                names
                    .filter((name) => name.startsWith('resqnet-') && !CURRENT_CACHES.includes(name))
                    .map((name) => caches.delete(name))
            ))
            .then(() => self.clients.claim())
    );
});

/* ── Strategies ──────────────────────────────────────────────────────── */

async function cacheFirst(request, cacheName) {
    const cached = await caches.match(request);
    if (cached) return cached;

    const response = await fetch(request);
    if (response && response.ok) {
        const cache = await caches.open(cacheName);
        cache.put(request, response.clone());
    }
    return response;
}

async function networkFirst(request, cacheName) {
    try {
        const response = await fetch(request);
        if (response && response.ok) {
            const cache = await caches.open(cacheName);
            cache.put(request, response.clone());
        }
        return response;
    } catch (err) {
        const cached = await caches.match(request);
        if (cached) return tagAsCached(cached);
        throw err;
    }
}

/* A cached API response is indistinguishable from a live one at the fetch()
 * layer — same status, same body. Without a marker the app would report
 * "Connected" and present stale figures as current while the gateway is dead,
 * which is precisely the wrong thing to do in an emergency. This header is how
 * app.js tells the difference. */
async function tagAsCached(response) {
    const body = await response.blob();
    const headers = new Headers(response.headers);
    headers.set('X-ResQNet-From-Cache', '1');
    return new Response(body, {
        status: response.status,
        statusText: response.statusText,
        headers,
    });
}

/* ── Fetch ───────────────────────────────────────────────────────────── */

self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    /* Never touch other origins, and never cache mutations. */
    if (url.origin !== self.location.origin) return;
    if (request.method !== 'GET') return;

    /* The health probe must always reflect reality — a cached "ok" would make
       the app claim it is connected while the gateway is off. */
    if (url.pathname === '/api/v1/health') return;

    // Page navigations
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request).catch(() => caches.match('/index.html'))
        );
        return;
    }

    // Map tiles
    if (url.pathname.startsWith('/assets/tiles/')) {
        event.respondWith(
            cacheFirst(request, TILE_CACHE).catch(() => Response.error())
        );
        return;
    }

    // API reads
    if (url.pathname.startsWith('/api/')) {
        event.respondWith(
            networkFirst(request, DATA_CACHE).catch(
                () => new Response(
                    JSON.stringify({ detail: 'Offline and no cached response available.' }),
                    { status: 503, headers: { 'Content-Type': 'application/json' } }
                )
            )
        );
        return;
    }

    // Everything else: static assets
    event.respondWith(
        cacheFirst(request, SHELL_CACHE).catch(() => caches.match('/index.html'))
    );
});

/* ── Background sync ─────────────────────────────────────────────────── */

/* Fired by the browser when connectivity returns, even if the app is closed.
 * The queue itself lives in localStorage, which a service worker cannot read,
 * so we wake any open page and let it flush. When no page is open the flush
 * happens on next launch instead — app.js calls outbox.flush() when the
 * connection state flips back to online. */
self.addEventListener('sync', (event) => {
    if (event.tag !== 'sync-outbox') return;
    event.waitUntil(
        self.clients.matchAll({ includeUncontrolled: true, type: 'window' })
            .then((clients) => {
                clients.forEach((client) => client.postMessage({ type: 'flush-outbox' }));
            })
    );
});

self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});
