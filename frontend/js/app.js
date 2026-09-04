/* ResQNet PWA — application core.
 *
 * Loaded as a CLASSIC script (not a module) so it can run before anything else
 * and expose a single global. Page modules ARE ES modules and are loaded on
 * demand; they reach shared helpers through `window.ResQNet`.
 *
 * Responsibilities:
 *   - hash-based routing
 *   - API client that degrades gracefully when the gateway is unreachable
 *   - connection state tracking + offline banner
 *   - an outbox that holds submissions made while offline
 */
(function () {
    'use strict';

    const API_BASE_URL = '/api/v1';
    const WS_PROTOCOL = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const WS_URL = `${WS_PROTOCOL}//${window.location.host}/ws/sync`;

    /* How long to wait for the gateway before treating it as unreachable.
       Kept short: a Raspberry Pi on a local hotspot answers in milliseconds,
       so anything slower almost certainly means the link is down. */
    const REQUEST_TIMEOUT_MS = 6000;
    const HEALTH_POLL_MS = 20000;

    const CACHE_PREFIX = 'resqnet:cache:';
    const OUTBOX_KEY = 'resqnet:outbox';

    /* ── Page registry ──────────────────────────────────────────────── */

    const PAGES = {
        'dashboard': () => import('./dashboard/dashboard.js'),
        'sos': () => import('./sos/sos.js'),
        'missing-persons': () => import('./missing-persons/missing-persons.js'),
        'volunteer': () => import('./volunteer/volunteer.js'),
        'map': () => import('./map/map.js'),
    };

    const DEFAULT_PAGE = 'dashboard';

    /* ── Small storage helpers ──────────────────────────────────────── */

    /* Private browsing and full-disk conditions make localStorage throw rather
       than return null, so every access is wrapped. Losing the cache is
       survivable; a thrown exception that blanks the whole UI is not. */
    function safeRead(key) {
        try {
            const raw = window.localStorage.getItem(key);
            return raw ? JSON.parse(raw) : null;
        } catch (err) {
            return null;
        }
    }

    function safeWrite(key, value) {
        try {
            window.localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (err) {
            return false;
        }
    }

    /* ── Connection state ───────────────────────────────────────────── */

    const connection = {
        online: navigator.onLine,
        listeners: [],

        set(isOnline) {
            if (this.online === isOnline) return;
            this.online = isOnline;
            render();
            this.listeners.forEach((fn) => {
                try { fn(isOnline); } catch (err) { /* one bad listener must not break the rest */ }
            });
            if (isOnline) outbox.flush();
        },

        onChange(fn) {
            this.listeners.push(fn);
        },
    };

    function render() {
        const online = connection.online;
        const pill = document.getElementById('connection-status');
        const dot = document.getElementById('connection-dot');
        const label = document.getElementById('connection-label');

        document.body.classList.toggle('is-offline', !online);

        if (!pill || !dot || !label) return;

        pill.className = online ? 'pill-rescue shrink-0' : 'pill-warning shrink-0';
        dot.className = `w-1.5 h-1.5 rounded-full ${online ? 'bg-rescue-400' : 'bg-warning-400'}`;

        const pending = outbox.count();
        label.textContent = online
            ? 'Connected'
            : (pending > 0 ? `Offline · ${pending} queued` : 'Offline');
    }

    window.addEventListener('online', () => connection.set(true));
    window.addEventListener('offline', () => connection.set(false));

    /* navigator.onLine only reports whether the device has *a* network
       connection — it says nothing about whether our gateway is reachable.
       A device can be joined to the node's Wi-Fi with the Pi powered down and
       still report "online", so we verify against the gateway itself. */
    async function pollHealth() {
        try {
            const res = await fetchWithTimeout(`${API_BASE_URL}/health`, { method: 'GET' }, 4000);
            connection.set(res.ok);
        } catch (err) {
            connection.set(false);
        }
    }

    /* ── Fetch with a timeout ───────────────────────────────────────── */

    function fetchWithTimeout(url, options, timeoutMs) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeoutMs || REQUEST_TIMEOUT_MS);
        return fetch(url, { ...options, signal: controller.signal })
            .finally(() => clearTimeout(timer));
    }

    /* ── Outbox: submissions made while offline ─────────────────────── */

    const outbox = {
        all() {
            return safeRead(OUTBOX_KEY) || [];
        },

        count() {
            return this.all().length;
        },

        add(endpoint, data) {
            const items = this.all();
            items.push({
                id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                endpoint,
                data,
                queuedAt: new Date().toISOString(),
            });
            safeWrite(OUTBOX_KEY, items);
            render();

            /* Ask the browser to retry for us once connectivity returns, even
               if the app is closed. Not supported everywhere, hence the
               manual flush() below as the reliable path. */
            if ('serviceWorker' in navigator && 'SyncManager' in window) {
                navigator.serviceWorker.ready
                    .then((reg) => reg.sync.register('sync-outbox'))
                    .catch(() => { /* fall back to flush() */ });
            }
        },

        async flush() {
            const items = this.all();
            if (items.length === 0) return { sent: 0, failed: 0 };

            const remaining = [];
            let sent = 0;

            for (const item of items) {
                try {
                    const res = await fetchWithTimeout(`${API_BASE_URL}${item.endpoint}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(item.data),
                    });
                    if (res.ok) {
                        sent += 1;
                    } else if (res.status >= 400 && res.status < 500) {
                        /* The gateway rejected the payload itself. Retrying
                           forever would block the queue, so drop it. */
                        sent += 1;
                    } else {
                        remaining.push(item);
                    }
                } catch (err) {
                    remaining.push(item);
                }
            }

            safeWrite(OUTBOX_KEY, remaining);
            render();
            return { sent, failed: remaining.length };
        },
    };

    /* ── API client ─────────────────────────────────────────────────── */

    class ApiClient {
        constructor(baseUrl) {
            this.baseUrl = baseUrl;
        }

        /* Returns { data, stale }.
           `stale: true` means the gateway could not be reached and the data
           came from the last successful response. Pages MUST surface that to
           the user — silently showing old numbers during an emergency is
           worse than showing nothing. */
        async get(endpoint) {
            const cacheKey = CACHE_PREFIX + endpoint;
            try {
                const res = await fetchWithTimeout(`${this.baseUrl}${endpoint}`);
                if (!res.ok) throw new Error(`API error: ${res.status}`);
                const data = await res.json();

                /* The service worker sets this when it served the request from
                   cache because the gateway was unreachable. Such a response
                   looks identical to a live one, so without this check the app
                   would claim to be connected while showing stale figures. */
                if (res.headers.get('X-ResQNet-From-Cache') === '1') {
                    connection.set(false);
                    return { data, stale: true };
                }

                safeWrite(cacheKey, { data, at: new Date().toISOString() });
                connection.set(true);
                return { data, stale: false };
            } catch (err) {
                connection.set(false);
                const cached = safeRead(cacheKey);
                if (cached) return { data: cached.data, stale: true, cachedAt: cached.at };
                throw err;
            }
        }

        /* Returns { queued: true } when the gateway was unreachable and the
           payload was stored in the outbox instead of being lost. */
        async post(endpoint, data) {
            try {
                const res = await fetchWithTimeout(`${this.baseUrl}${endpoint}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data),
                });
                if (!res.ok) throw new Error(`API error: ${res.status}`);
                connection.set(true);
                return { data: await res.json(), queued: false };
            } catch (err) {
                connection.set(false);
                outbox.add(endpoint, data);
                return { data: null, queued: true };
            }
        }

        async put(endpoint, data) {
            const res = await fetchWithTimeout(`${this.baseUrl}${endpoint}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error(`API error: ${res.status}`);
            return res.json();
        }

        async delete(endpoint) {
            const res = await fetchWithTimeout(`${this.baseUrl}${endpoint}`, { method: 'DELETE' });
            if (!res.ok) throw new Error(`API error: ${res.status}`);
            return res.json();
        }
    }

    const api = new ApiClient(API_BASE_URL);

    /* ── Lazy asset loading ─────────────────────────────────────────── */

    const loadedAssets = new Set();

    /* Leaflet is ~150KB. Only the map page needs it, so it is not in the
       document head — loading it on the SOS form would waste time and memory
       on exactly the low-end phones this app targets. */
    function loadAsset(url, type) {
        if (loadedAssets.has(url)) return Promise.resolve();
        return new Promise((resolve, reject) => {
            let el;
            if (type === 'css') {
                el = document.createElement('link');
                el.rel = 'stylesheet';
                el.href = url;
            } else {
                el = document.createElement('script');
                el.src = url;
            }
            el.onload = () => { loadedAssets.add(url); resolve(); };
            el.onerror = () => reject(new Error(`Failed to load ${url}`));
            document.head.appendChild(el);
        });
    }

    /* ── Shared view helpers ────────────────────────────────────────── */

    /* Text from the API is inserted as textContent, never interpolated into
       an HTML string. Field reports are user-supplied and will eventually
       contain characters that would otherwise break — or inject into — markup. */
    function escapeHtml(value) {
        if (value === null || value === undefined) return '';
        const div = document.createElement('div');
        div.textContent = String(value);
        return div.innerHTML;
    }

    function pageHeader(title, description) {
        return `
            <div class="mb-6 sm:mb-8">
                <h2 class="text-headline text-ink">${escapeHtml(title)}</h2>
                ${description ? `<p class="text-body-sm text-ink-muted mt-1">${escapeHtml(description)}</p>` : ''}
            </div>`;
    }

    function staleNotice(result) {
        if (!result || !result.stale) return '';
        return `
            <div class="panel border-warning-500/30 bg-warning-500/5 px-4 py-3 mb-6
                        flex items-start gap-3">
                <span class="text-warning-400 mt-0.5" aria-hidden="true">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                         stroke-width="2" stroke-linecap="round">
                        <circle cx="12" cy="12" r="10"/><path d="M12 8v5M12 16h.01"/>
                    </svg>
                </span>
                <p class="text-body-sm text-warning-400">
                    Gateway unreachable. Showing the last data received by this device.
                </p>
            </div>`;
    }

    function emptyState(message, hint) {
        return `
            <div class="text-center py-12 px-4">
                <p class="text-body text-ink-muted">${escapeHtml(message)}</p>
                ${hint ? `<p class="text-body-sm text-ink-subtle mt-1">${escapeHtml(hint)}</p>` : ''}
            </div>`;
    }

    function errorState(message) {
        return `
            <div class="panel border-emergency-500/30 bg-emergency-500/5 px-4 py-4">
                <p class="text-body-sm text-emergency-400">${escapeHtml(message)}</p>
            </div>`;
    }

    /* ── Router ─────────────────────────────────────────────────────── */

    function currentPage() {
        const raw = (window.location.hash || '').replace(/^#\/?/, '').trim();
        return Object.prototype.hasOwnProperty.call(PAGES, raw) ? raw : DEFAULT_PAGE;
    }

    function markActiveNav(pageName) {
        document.querySelectorAll('#main-nav a').forEach((link) => {
            const isActive = link.dataset.page === pageName;
            if (isActive) {
                link.setAttribute('aria-current', 'page');
            } else {
                link.removeAttribute('aria-current');
            }
        });
    }

    let routeToken = 0;

    async function loadPage(pageName) {
        const content = document.getElementById('app-content');
        if (!content) return;

        /* Guard against a slow page resolving after the user has already
           navigated somewhere else. */
        const token = ++routeToken;

        markActiveNav(pageName);
        content.innerHTML = `
            <div class="space-y-4" role="status" aria-label="Loading">
                <div class="skeleton h-8 w-48"></div>
                <div class="skeleton h-32 w-full"></div>
            </div>`;

        try {
            const module = await PAGES[pageName]();
            if (token !== routeToken) return;
            content.innerHTML = '';
            if (typeof module.render === 'function') {
                await module.render(content);
            }
        } catch (err) {
            if (token !== routeToken) return;
            content.innerHTML = errorState(`Could not load this page: ${err.message}`);
        }
    }

    function handleRoute() {
        loadPage(currentPage());
    }

    window.addEventListener('hashchange', handleRoute);

    /* ── Public surface for page modules ────────────────────────────── */

    window.ResQNet = {
        api,
        outbox,
        connection,
        loadAsset,
        escapeHtml,
        pageHeader,
        staleNotice,
        emptyState,
        errorState,
        WS_URL,
    };

    /* ── Boot ───────────────────────────────────────────────────────── */

    function boot() {
        const host = document.getElementById('footer-host');
        if (host) host.textContent = window.location.host || 'local';

        if (!window.location.hash) {
            window.location.replace(`#/${DEFAULT_PAGE}`);
        }

        render();
        handleRoute();
        pollHealth();
        setInterval(pollHealth, HEALTH_POLL_MS);

        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/service-worker.js')
                .catch((err) => console.error('Service worker registration failed', err));

            /* The outbox lives in localStorage, which a service worker cannot
               read. When the browser fires a background sync the worker pings
               us and we do the sending. */
            navigator.serviceWorker.addEventListener('message', (event) => {
                if (event.data && event.data.type === 'flush-outbox') outbox.flush();
            });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
})();
