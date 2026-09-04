/* Offline map.
 *
 * Leaflet is loaded from /vendor/ on demand — never from a CDN, and never on
 * pages that do not need it.
 *
 * TILES: raster map imagery is not bundled. Bulk-downloading tiles from the
 * public OpenStreetMap servers is expressly forbidden by their tile usage
 * policy, and a worldwide pack would be hundreds of gigabytes regardless. A
 * deployment generates a pack for its own operating area and drops it in
 * frontend/assets/tiles/{z}/{x}/{y}.png — see CLAUDE.md section 8.
 *
 * Without a pack the map still works: markers, zoom, pan and coordinates are
 * all fully functional over the grid backdrop. Position is what matters in the
 * field; the satellite imagery is a convenience.
 */

const { api, pageHeader, staleNotice, escapeHtml, loadAsset } = window.ResQNet;

const TILE_URL = '/assets/tiles/{z}/{x}/{y}.png';

/* Fallback view: geographic centre of India, zoomed out far enough to be a
   sane starting point before any real markers arrive. */
const DEFAULT_VIEW = { lat: 20.5937, lng: 78.9629, zoom: 5 };

const LAYERS = [
    { key: 'nodes',                 label: 'Rescue Nodes',   color: '#60a5fa', latKey: 'latitude', lngKey: 'longitude' },
    { key: 'sos_reports',           label: 'SOS Reports',    color: '#ff4d4f', latKey: 'latitude', lngKey: 'longitude' },
    { key: 'missing_persons',       label: 'Missing Persons',color: '#f5a524', latKey: 'last_seen_lat', lngKey: 'last_seen_lng' },
    { key: 'resource_requests',     label: 'Resources',      color: '#a8b0bd', latKey: 'location_lat', lngKey: 'location_lng' },
    { key: 'deployment_locations',  label: 'Deployments',    color: '#22c55e', latKey: 'latitude', lngKey: 'longitude' },
];

/* A CSS marker rather than a PNG: one less asset to load, and it can be
   coloured straight from the design tokens. */
function markerIcon(L, color) {
    return L.divIcon({
        className: '',
        html: `<span style="
            display:block; width:14px; height:14px; border-radius:9999px;
            background:${color}; border:2px solid #0a0b0d;
            box-shadow:0 0 0 2px ${color}66, 0 2px 6px rgba(0,0,0,.6);"></span>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
    });
}

function popupHtml(item, label) {
    const title = item.name || item.node_id || item.reporter_name
        || item.location_name || item.resource_type || label;
    const bits = [];
    if (item.status) bits.push(`Status: ${item.status}`);
    if (item.severity) bits.push(`Severity: ${item.severity}`);
    if (item.urgency) bits.push(`Urgency: ${item.urgency}`);
    if (item.description) bits.push(item.description);

    return `
        <strong style="display:block;margin-bottom:4px">${escapeHtml(title)}</strong>
        <span style="color:#6f7783;font-size:11px;text-transform:uppercase;letter-spacing:.4px">
            ${escapeHtml(label)}
        </span>
        ${bits.length ? `<p style="margin:6px 0 0">${escapeHtml(bits.join(' · '))}</p>` : ''}`;
}

/* Is a tile pack installed? The gateway reports this on /health. We ask it
   rather than probing for a tile, because probing logs a 404 in the console on
   every deployment that has no pack — which is most of them. */
async function hasTilePack() {
    try {
        const res = await fetch('/api/v1/health');
        if (!res.ok) return false;
        const health = await res.json();
        return health.tiles_available === true;
    } catch (err) {
        return false;
    }
}

function legend() {
    return LAYERS.map((layer) => `
        <label class="flex items-center gap-2 cursor-pointer select-none">
            <input type="checkbox" data-layer="${layer.key}" checked
                   class="w-4 h-4 rounded accent-accent-500 bg-surface-2 border-hairline">
            <span class="w-2.5 h-2.5 rounded-full shrink-0"
                  style="background:${layer.color}" aria-hidden="true"></span>
            <span class="text-body-sm text-ink-muted">${escapeHtml(layer.label)}</span>
            <span class="text-caption text-ink-subtle tabular" data-count="${layer.key}">0</span>
        </label>`).join('');
}

export async function render(container) {
    container.innerHTML = `
        ${pageHeader('Map', 'Node positions, incidents and deployments')}
        <div id="map-notice"></div>
        <div class="panel p-4 mb-4">
            <div class="flex flex-wrap items-center gap-x-6 gap-y-3">${legend()}</div>
        </div>
        <div id="map" role="application" aria-label="Operations map"></div>`;

    const notice = container.querySelector('#map-notice');

    /* Leaflet is ~150KB and only this page needs it. */
    try {
        await loadAsset('/vendor/leaflet/leaflet.css', 'css');
        await loadAsset('/vendor/leaflet/leaflet.js', 'js');
    } catch (err) {
        notice.innerHTML = window.ResQNet.errorState(
            'Map library failed to load. Check that frontend/vendor/leaflet/ is present.'
        );
        return;
    }

    const L = window.L;
    const map = L.map('map', { zoomControl: true, attributionControl: true })
        .setView([DEFAULT_VIEW.lat, DEFAULT_VIEW.lng], DEFAULT_VIEW.zoom);

    /* Leaflet's default attribution prefix links to leafletjs.com, which is a
       dead link with no internet. Drop it. */
    map.attributionControl.setPrefix(false);

    if (await hasTilePack()) {
        L.tileLayer(TILE_URL, {
            maxZoom: 19,
            attribution: 'Offline tiles · © OpenStreetMap contributors',
            errorTileUrl: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
        }).addTo(map);
    } else {
        notice.innerHTML = `
            <div class="panel border-info-500/30 bg-info-500/5 px-4 py-3 mb-4
                        flex items-start gap-3">
                <span class="text-info-400 mt-0.5" aria-hidden="true">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                         stroke-width="2" stroke-linecap="round">
                        <circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>
                    </svg>
                </span>
                <p class="text-body-sm text-info-400">
                    No offline tile pack installed, so the map has no imagery.
                    Markers, coordinates, zoom and pan all work normally.
                </p>
            </div>`;
        map.attributionControl.addAttribution('Grid view — no tile pack');
    }

    /* ---- Markers ---- */

    const groups = {};
    LAYERS.forEach((layer) => {
        groups[layer.key] = L.layerGroup().addTo(map);
    });

    container.querySelectorAll('input[data-layer]').forEach((input) => {
        input.addEventListener('change', () => {
            const group = groups[input.dataset.layer];
            if (input.checked) map.addLayer(group); else map.removeLayer(group);
        });
    });

    let result;
    try {
        result = await api.get('/dashboard/map');
    } catch (err) {
        notice.insertAdjacentHTML('beforeend', window.ResQNet.errorState(
            'Map data unavailable and nothing cached on this device yet.'
        ));
        return;
    }

    if (result.stale) notice.insertAdjacentHTML('afterbegin', staleNotice(result));

    const data = result.data || {};
    const bounds = [];

    LAYERS.forEach((layer) => {
        const items = Array.isArray(data[layer.key]) ? data[layer.key] : [];
        const icon = markerIcon(L, layer.color);
        let plotted = 0;

        items.forEach((item) => {
            const lat = Number(item[layer.latKey]);
            const lng = Number(item[layer.lngKey]);
            /* Records without coordinates are normal — a report can be filed
               before a position is known. Skip them rather than plotting 0,0
               in the Gulf of Guinea. */
            if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

            L.marker([lat, lng], { icon })
                .bindPopup(popupHtml(item, layer.label))
                .addTo(groups[layer.key]);
            bounds.push([lat, lng]);
            plotted += 1;
        });

        const counter = container.querySelector(`[data-count="${layer.key}"]`);
        if (counter) counter.textContent = plotted;
    });

    if (bounds.length > 0) {
        map.fitBounds(bounds, { padding: [48, 48], maxZoom: 15 });
    }

    /* Leaflet mis-measures its container if the element was laid out after
       init. One invalidate on the next frame fixes the grey-band artefact. */
    requestAnimationFrame(() => map.invalidateSize());
}
