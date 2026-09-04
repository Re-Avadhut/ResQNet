// Service Worker for ResQNet PWA - Offline-first
// 
// TODO: Implement caching strategies:
// - Cache-first for static assets
// - Network-first for API requests with offline fallback
// - Sync pending data when back online
//
// KNOWN GAP: Tailwind and Leaflet still load from a CDN in index.html, so the
// app is NOT genuinely offline-capable yet. They must be vendored into
// frontend/vendor/ before this can work in a real disaster zone.

const CACHE_NAME = 'resqnet-v1';
// App shell. SAME-ORIGIN FILES ONLY.
// cache.addAll() is all-or-nothing: if a single entry 404s or is an opaque
// cross-origin response, the whole install() rejects and the service worker
// never activates - which silently kills offline mode. Do not add a path here
// unless the file really exists in frontend/.
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/manifest.json',
    '/css/styles.css',
    '/js/app.js',
    '/js/dashboard/dashboard.js',
    '/js/sos/sos.js',
    '/js/missing-persons/missing-persons.js',
    '/js/volunteer/volunteer.js',
    '/js/map/map.js'
];

// Install event - cache app shell
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    // TODO: Implement smart caching strategy
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        }).catch(() => {
            // TODO: Return offline fallback page
        })
    );
});

// Background sync - sync data when connection is restored
// TODO: Implement background sync for pending SOS reports, messages
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-sos-reports') {
        // TODO: Send pending SOS reports
    }
});