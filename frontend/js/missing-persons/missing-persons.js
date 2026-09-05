/* Missing persons registry.
 *
 * The gateway has models for this (gateway/app/models/missing_person.py) but
 * no routes yet, so the list reads from the map payload, which is the only
 * endpoint currently exposing missing-person records. Swap to a dedicated
 * /missing-persons endpoint once it exists — see docs/api.md.
 */

const { api, pageHeader, staleNotice, emptyState, escapeHtml } = window.ResQNet;

const STATUS_PILL = {
    missing: 'pill-warning',
    found: 'pill-rescue',
    deceased: 'pill-neutral',
};

function personCard(person) {
    const status = String(person.status || 'missing').toLowerCase();
    const details = [
        person.age ? `Age ${person.age}` : null,
        person.gender || null,
        person.last_seen_location || null,
    ].filter(Boolean);

    return `
        <li class="panel panel-hover p-5">
            <div class="flex items-start justify-between gap-3 mb-2">
                <h4 class="text-body font-medium text-ink truncate">
                    ${escapeHtml(person.name || 'Unnamed')}
                </h4>
                <span class="${STATUS_PILL[status] || 'pill-neutral'} shrink-0">
                    ${escapeHtml(status)}
                </span>
            </div>
            ${details.length
                ? `<p class="text-body-sm text-ink-muted">${escapeHtml(details.join(' · '))}</p>`
                : ''}
            ${person.description
                ? `<p class="text-body-sm text-ink-subtle mt-2">${escapeHtml(person.description)}</p>`
                : ''}
            ${person.contact_phone
                ? `<p class="text-caption text-ink-subtle mt-3">
                       Contact: ${escapeHtml(person.contact_name || '')}
                       ${escapeHtml(person.contact_phone)}
                   </p>`
                : ''}
        </li>`;
}

export async function render(container) {
    container.innerHTML = `
        ${pageHeader('Missing Persons', 'Registry of people reported missing')}

        <div class="flex flex-wrap items-center gap-3 mb-6">
            <label class="sr-only" for="mp-search">Search by name or location</label>
            <input id="mp-search" type="search" class="field max-w-sm"
                   placeholder="Search by name or location">
            <label class="sr-only" for="mp-filter">Filter by status</label>
            <select id="mp-filter" class="field w-auto">
                <option value="">All statuses</option>
                <option value="missing">Missing</option>
                <option value="found">Found</option>
            </select>
        </div>

        <div id="mp-notice"></div>
        <ul id="mp-list" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <li class="skeleton h-32"></li>
            <li class="skeleton h-32"></li>
            <li class="skeleton h-32"></li>
        </ul>`;

    const list = container.querySelector('#mp-list');
    const notice = container.querySelector('#mp-notice');
    const search = container.querySelector('#mp-search');
    const filter = container.querySelector('#mp-filter');

    let people = [];

    try {
        const result = await api.get('/dashboard/map');
        people = result.data?.missing_persons || [];
        if (result.stale) notice.innerHTML = staleNotice(result);
    } catch (err) {
        list.innerHTML = '';
        notice.innerHTML = window.ResQNet.errorState(
            'Cannot reach the gateway, and no records are cached on this device.'
        );
        return;
    }

    function paint() {
        const term = search.value.trim().toLowerCase();
        const status = filter.value;

        const visible = people.filter((person) => {
            if (status && String(person.status || 'missing').toLowerCase() !== status) return false;
            if (!term) return true;
            return `${person.name || ''} ${person.last_seen_location || ''}`
                .toLowerCase()
                .includes(term);
        });

        if (visible.length === 0) {
            list.className = '';
            list.innerHTML = `<li>${people.length === 0
                ? emptyState('No missing person reports.', 'Reports filed from the field will appear here.')
                : emptyState('No records match your search.')}</li>`;
            return;
        }

        list.className = 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4';
        list.innerHTML = visible.map(personCard).join('');
    }

    search.addEventListener('input', paint);
    filter.addEventListener('change', paint);
    paint();
}
