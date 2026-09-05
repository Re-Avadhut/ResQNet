// Service Worker for ResQNet PWA - Offline-first
// 
// TODO: Implement caching strategies:
// - Cache app shell (HTML, CSS, JS) on install
// - Cache-first for static assets
// - Network-first for API requests with offline fallback
// - Sync pending data when back online

const CACHE_NAME = 'resqnet-v1';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/manifest.json',
    '/css/tailwind.css',
    '/js/app.js',
    '/js/dashboard/dashboard.js',
    '/js/sos/sos.js',
    '/js/missing-persons/missing-persons.js',
    '/js/volunteer/volunteer.js',
    '/js/map/map.js',
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
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