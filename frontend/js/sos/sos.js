/* SOS reporting.
 *
 * This is the most important screen in the application, and the one most
 * likely to be used with no connectivity at all. A submission is NEVER lost:
 * if the gateway cannot be reached the report goes into the outbox in local
 * storage and is sent automatically once the link returns.
 */

const {
    api, outbox, pageHeader, staleNotice, emptyState, escapeHtml,
} = window.ResQNet;

const SEVERITIES = [
    { value: 'low',      label: 'Low — no immediate danger' },
    { value: 'medium',   label: 'Medium — assistance needed' },
    { value: 'high',     label: 'High — urgent' },
    { value: 'critical', label: 'Critical — life-threatening' },
];

const SEVERITY_PILL = {
    critical: 'pill-emergency',
    high: 'pill-emergency',
    medium: 'pill-warning',
    low: 'pill-info',
};

function reportRow(report) {
    const severity = String(report.severity || 'medium').toLowerCase();
    const status = String(report.status || 'active').toLowerCase();
    const when = report.timestamp
        ? new Date(report.timestamp).toLocaleString()
        : '';

    return `
        <li class="px-5 py-4 border-b border-hairline last:border-0">
            <div class="flex items-start justify-between gap-4">
                <div class="min-w-0">
                    <p class="text-body-sm text-ink">
                        ${escapeHtml(report.description || 'No description provided')}
                    </p>
                    <p class="text-caption text-ink-subtle mt-1">
                        ${escapeHtml(report.reporter_name || 'Anonymous')}
                        ${when ? ` · ${escapeHtml(when)}` : ''}
                    </p>
                </div>
                <div class="flex flex-col items-end gap-1.5 shrink-0">
                    <span class="${SEVERITY_PILL[severity] || 'pill-neutral'}">${escapeHtml(severity)}</span>
                    <span class="text-caption text-ink-subtle">${escapeHtml(status)}</span>
                </div>
            </div>
        </li>`;
}

function queuedRow(item) {
    return `
        <li class="px-5 py-4 border-b border-hairline last:border-0
                   flex items-start justify-between gap-4">
            <div class="min-w-0">
                <p class="text-body-sm text-ink">
                    ${escapeHtml(item.data?.description || 'No description provided')}
                </p>
                <p class="text-caption text-ink-subtle mt-1">
                    Queued ${escapeHtml(new Date(item.queuedAt).toLocaleString())}
                </p>
            </div>
            <span class="pill-warning shrink-0">Pending</span>
        </li>`;
}

export async function render(container) {
    container.innerHTML = `
        ${pageHeader('SOS Report', 'File an emergency report. Works with no connection.')}

        <div class="grid grid-cols-1 lg:grid-cols-5 gap-6">

            <!-- Form -->
            <section class="lg:col-span-3">
                <form id="sos-form" class="panel p-5 sm:p-6 space-y-5" novalidate>
                    <div>
                        <label class="field-label" for="sos-description">
                            What is happening? <span class="text-emergency-400">*</span>
                        </label>
                        <textarea id="sos-description" name="description" class="field"
                                  required maxlength="500"
                                  placeholder="Describe the emergency and how many people are affected"></textarea>
                    </div>

                    <div>
                        <label class="field-label" for="sos-severity">Severity</label>
                        <select id="sos-severity" name="severity" class="field">
                            ${SEVERITIES.map((s) => `
                                <option value="${s.value}" ${s.value === 'medium' ? 'selected' : ''}>
                                    ${escapeHtml(s.label)}
                                </option>`).join('')}
                        </select>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label class="field-label" for="sos-name">Your name</label>
                            <input id="sos-name" name="reporter_name" type="text"
                                   class="field" maxlength="100" autocomplete="name"
                                   placeholder="Optional">
                        </div>
                        <div>
                            <label class="field-label" for="sos-contact">Contact</label>
                            <input id="sos-contact" name="reporter_contact" type="tel"
                                   class="field" maxlength="50" autocomplete="tel"
                                   placeholder="Phone or radio call sign">
                        </div>
                    </div>

                    <div>
                        <span class="field-label">Location</span>
                        <div class="flex flex-wrap items-center gap-3">
                            <button type="button" id="sos-locate" class="btn-secondary">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                     stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                     aria-hidden="true">
                                    <circle cx="12" cy="12" r="3"/>
                                    <path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>
                                </svg>
                                Use my GPS position
                            </button>
                            <p id="sos-location-status" class="text-body-sm text-ink-subtle tabular">
                                Not set
                            </p>
                        </div>
                        <input type="hidden" name="latitude">
                        <input type="hidden" name="longitude">
                    </div>

                    <div id="sos-feedback" role="status" aria-live="polite"></div>

                    <div class="flex items-center gap-3 pt-1">
                        <button type="submit" id="sos-submit" class="btn-emergency">
                            Submit SOS
                        </button>
                        <p class="text-caption text-ink-subtle">
                            Saved on this device if offline.
                        </p>
                    </div>
                </form>
            </section>

            <!-- Recent reports -->
            <section class="lg:col-span-2">
                <div class="panel overflow-hidden">
                    <h3 class="text-body font-medium text-ink px-5 py-4 border-b border-hairline">
                        Recent Reports
                    </h3>
                    <div id="sos-list">
                        <div class="px-5 py-6 space-y-3">
                            <div class="skeleton h-4 w-3/4"></div>
                            <div class="skeleton h-4 w-1/2"></div>
                        </div>
                    </div>
                </div>
            </section>
        </div>`;

    const form = container.querySelector('#sos-form');
    const feedback = container.querySelector('#sos-feedback');
    const submitBtn = container.querySelector('#sos-submit');
    const locateBtn = container.querySelector('#sos-locate');
    const locationStatus = container.querySelector('#sos-location-status');

    /* ---- GPS ---- */

    locateBtn.addEventListener('click', () => {
        if (!navigator.geolocation) {
            locationStatus.textContent = 'GPS not available on this device';
            return;
        }
        locationStatus.textContent = 'Locating…';
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords;
                form.latitude.value = latitude;
                form.longitude.value = longitude;
                locationStatus.textContent = `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
                locationStatus.className = 'text-body-sm text-rescue-400 tabular';
            },
            (err) => {
                locationStatus.textContent = `Unavailable (${err.message})`;
                locationStatus.className = 'text-body-sm text-warning-400';
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
        );
    });

    /* ---- Submit ---- */

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const description = form.description.value.trim();
        if (!description) {
            feedback.innerHTML = `
                <p class="text-body-sm text-emergency-400">
                    Please describe what is happening.
                </p>`;
            form.description.focus();
            return;
        }

        const payload = {
            description,
            severity: form.severity.value,
            reporter_name: form.reporter_name.value.trim() || null,
            reporter_contact: form.reporter_contact.value.trim() || null,
            latitude: form.latitude.value ? Number(form.latitude.value) : null,
            longitude: form.longitude.value ? Number(form.longitude.value) : null,
        };

        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting…';
        feedback.innerHTML = '';

        const result = await api.post('/sos/report', payload);

        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit SOS';

        feedback.innerHTML = result.queued
            ? `<div class="panel border-warning-500/30 bg-warning-500/5 px-4 py-3">
                   <p class="text-body-sm text-warning-400">
                       No connection to the gateway. Your report is saved on this device
                       and will send automatically once the link returns.
                   </p>
               </div>`
            : `<div class="panel border-rescue-500/30 bg-rescue-500/5 px-4 py-3">
                   <p class="text-body-sm text-rescue-400">Report submitted.</p>
               </div>`;

        form.reset();
        locationStatus.textContent = 'Not set';
        locationStatus.className = 'text-body-sm text-ink-subtle tabular';
        loadReports(container);
    });

    loadReports(container);
}

async function loadReports(container) {
    const list = container.querySelector('#sos-list');
    if (!list) return;

    const pending = outbox.all().filter((item) => item.endpoint === '/sos/report');

    let reports = [];
    let stale = false;
    try {
        const result = await api.get('/sos/');
        reports = result.data?.reports || [];
        stale = result.stale;
    } catch (err) {
        /* No cached list yet. Anything queued locally is still worth showing. */
    }

    if (pending.length === 0 && reports.length === 0) {
        list.innerHTML = emptyState('No reports yet.', 'Submitted reports appear here.');
        return;
    }

    list.innerHTML =
        (stale ? `<div class="px-5 pt-4">${staleNotice({ stale: true })}</div>` : '') +
        `<ul>
            ${pending.map(queuedRow).join('')}
            ${reports.map(reportRow).join('')}
        </ul>`;
}
