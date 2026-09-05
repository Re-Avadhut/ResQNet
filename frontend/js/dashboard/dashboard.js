/* Dashboard — operational overview.
 *
 * Reads GET /api/v1/dashboard/overview and GET /api/v1/dashboard/alerts.
 *
 * NOTE: those endpoints are still stubs on the gateway and return zeros. This
 * page is wired to the real API and will show real figures the moment the
 * backend is implemented — the numbers below are not hardcoded.
 */

const { api, pageHeader, staleNotice, emptyState, errorState, escapeHtml } = window.ResQNet;

/* Which figures to show, and how to pull each one out of the overview payload.
   Shape is defined in docs/api.md. */
const STATS = [
    {
        key: 'nodes',
        label: 'Rescue Nodes',
        tone: 'info',
        value: (d) => d?.nodes?.active ?? 0,
        detail: (d) => `${d?.nodes?.total ?? 0} registered`,
    },
    {
        key: 'sos',
        label: 'Active SOS',
        tone: 'emergency',
        value: (d) => d?.sos?.active ?? 0,
        detail: (d) => `${d?.sos?.resolved_today ?? 0} resolved today`,
    },
    {
        key: 'volunteers',
        label: 'Volunteers',
        tone: 'rescue',
        value: (d) => d?.volunteers?.deployed ?? 0,
        detail: (d) => `${d?.volunteers?.total ?? 0} registered`,
    },
    {
        key: 'resources',
        label: 'Resource Requests',
        tone: 'warning',
        value: (d) => d?.resources?.pending ?? 0,
        detail: (d) => `${d?.resources?.delivered_today ?? 0} delivered today`,
    },
];

const TONE_TEXT = {
    emergency: 'text-emergency-400',
    warning: 'text-warning-400',
    rescue: 'text-rescue-400',
    info: 'text-info-400',
};

function statCard(stat, data) {
    const value = stat.value(data);
    /* Active SOS is the one number someone scans for first, so it gets a
       coloured border the others do not. */
    const urgent = stat.key === 'sos' && value > 0;

    return `
        <div class="panel panel-hover p-5 ${urgent ? 'border-emergency-500/40' : ''}">
            <p class="eyebrow">${escapeHtml(stat.label)}</p>
            <p class="text-stat tabular mt-3 ${TONE_TEXT[stat.tone] || 'text-ink'}">${escapeHtml(value)}</p>
            <p class="text-caption text-ink-subtle mt-2">${escapeHtml(stat.detail(data))}</p>
        </div>`;
}

const SEVERITY_PILL = {
    critical: 'pill-emergency',
    high: 'pill-emergency',
    medium: 'pill-warning',
    low: 'pill-info',
};

function alertRow(alert) {
    const severity = String(alert.severity || 'medium').toLowerCase();
    const pill = SEVERITY_PILL[severity] || 'pill-neutral';
    return `
        <li class="flex items-start justify-between gap-4 px-5 py-4
                   border-b border-hairline last:border-0">
            <div class="min-w-0">
                <p class="text-body-sm text-ink truncate">
                    ${escapeHtml(alert.message || alert.description || 'Unspecified alert')}
                </p>
                <p class="text-caption text-ink-subtle mt-1">
                    ${escapeHtml(alert.location || alert.type || '')}
                </p>
            </div>
            <span class="${pill} shrink-0">${escapeHtml(severity)}</span>
        </li>`;
}

export async function render(container) {
    let overview;
    try {
        overview = await api.get('/dashboard/overview');
    } catch (err) {
        container.innerHTML =
            pageHeader('Dashboard', 'Live operational overview') +
            errorState('Cannot reach the gateway, and this device has no cached data yet.');
        return;
    }

    const data = overview.data || {};

    container.innerHTML = `
        ${pageHeader('Dashboard', 'Live operational overview')}
        ${staleNotice(overview)}

        <section aria-label="Key figures"
                 class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            ${STATS.map((s) => statCard(s, data)).join('')}
        </section>

        <section aria-label="Active alerts" class="panel overflow-hidden">
            <div class="flex items-center justify-between px-5 py-4 border-b border-hairline">
                <h3 class="text-body font-medium text-ink">Active Alerts</h3>
                <a href="#/sos" class="text-body-sm text-accent-400 hover:text-accent-500">
                    View all SOS
                </a>
            </div>
            <div id="alerts-body">
                <div class="px-5 py-6 space-y-3">
                    <div class="skeleton h-4 w-2/3"></div>
                    <div class="skeleton h-4 w-1/2"></div>
                </div>
            </div>
        </section>`;

    /* Alerts load after the stat cards are painted, so a slow or failing
       alerts call never delays the numbers people came here to read. */
    const body = container.querySelector('#alerts-body');
    try {
        const alerts = await api.get('/dashboard/alerts');
        const list = alerts.data?.alerts || [];
        body.innerHTML = list.length
            ? `<ul>${list.map(alertRow).join('')}</ul>`
            : emptyState('No active alerts.', 'Incoming SOS reports will appear here.');
    } catch (err) {
        body.innerHTML = emptyState('Alerts unavailable while offline.');
    }
}
