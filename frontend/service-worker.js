// Service Worker for the local ResQNet app shell.

const CACHE_NAME = 'resqnet-v1';
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
    '/js/map/map.js',
    '/service-worker.js'
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
    if (event.request.method !== 'GET') {
        return;
    }

    const requestUrl = new URL(event.request.url);
    if (requestUrl.pathname.startsWith('/api/') || requestUrl.pathname.startsWith('/ws/')) {
        return;
    }

    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request).then((networkResponse) => {
                if (networkResponse.ok && requestUrl.origin === self.location.origin) {
                    const responseCopy = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseCopy));
                }
                return networkResponse;
            });
        }).catch(() => {
            return caches.match('/index.html');
        })
    );
});

// Background sync is reserved for the future offline outbox implementation.
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-sos-reports') {
        event.waitUntil(Promise.resolve());
    }
});