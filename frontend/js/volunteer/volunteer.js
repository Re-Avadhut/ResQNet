/* Volunteer registry.
 *
 * The gateway has a Volunteer model but no routes yet, so there is nothing to
 * read from. Rather than fake a list, this page shows the registration form
 * (which queues offline like any other submission) and an honest empty state.
 * Wire the list up when /api/v1/volunteers exists — see docs/api.md.
 */

const { api, outbox, pageHeader, emptyState, escapeHtml } = window.ResQNet;

const SKILLS = [
    'Medical', 'Search & Rescue', 'Logistics', 'Driving',
    'Communications', 'Translation', 'Engineering', 'Cooking',
];

export async function render(container) {
    container.innerHTML = `
        ${pageHeader('Volunteers', 'Register and coordinate field volunteers')}

        <div class="grid grid-cols-1 lg:grid-cols-5 gap-6">

            <section class="lg:col-span-3">
                <form id="volunteer-form" class="panel p-5 sm:p-6 space-y-5" novalidate>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label class="field-label" for="v-name">
                                Name <span class="text-emergency-400">*</span>
                            </label>
                            <input id="v-name" name="name" type="text" class="field"
                                   required maxlength="100" autocomplete="name">
                        </div>
                        <div>
                            <label class="field-label" for="v-phone">Phone</label>
                            <input id="v-phone" name="phone" type="tel" class="field"
                                   maxlength="50" autocomplete="tel">
                        </div>
                    </div>

                    <div>
                        <label class="field-label" for="v-email">Email</label>
                        <input id="v-email" name="email" type="email" class="field"
                               maxlength="100" autocomplete="email" placeholder="Optional">
                    </div>

                    <fieldset>
                        <legend class="field-label">Skills</legend>
                        <div class="flex flex-wrap gap-2">
                            ${SKILLS.map((skill) => `
                                <label class="inline-flex items-center gap-2 px-3 py-2 rounded-md
                                              bg-surface-2 border border-hairline cursor-pointer
                                              hover:border-hairline-strong transition-colors">
                                    <input type="checkbox" name="skills" value="${escapeHtml(skill)}"
                                           class="w-4 h-4 rounded accent-accent-500">
                                    <span class="text-body-sm text-ink-muted">${escapeHtml(skill)}</span>
                                </label>`).join('')}
                        </div>
                    </fieldset>

                    <div>
                        <label class="field-label" for="v-availability">Availability</label>
                        <select id="v-availability" name="availability" class="field">
                            <option value="available">Available now</option>
                            <option value="deployed">Currently deployed</option>
                            <option value="offline">Unavailable</option>
                        </select>
                    </div>

                    <div id="v-feedback" role="status" aria-live="polite"></div>

                    <button type="submit" id="v-submit" class="btn-primary">Register</button>
                </form>
            </section>

            <section class="lg:col-span-2">
                <div class="panel overflow-hidden">
                    <h3 class="text-body font-medium text-ink px-5 py-4 border-b border-hairline">
                        Registered Volunteers
                    </h3>
                    <div id="v-list"></div>
                </div>
            </section>
        </div>`;

    const form = container.querySelector('#volunteer-form');
    const feedback = container.querySelector('#v-feedback');
    const submitBtn = container.querySelector('#v-submit');

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const name = form.name.value.trim();
        if (!name) {
            feedback.innerHTML =
                '<p class="text-body-sm text-emergency-400">A name is required.</p>';
            form.name.focus();
            return;
        }

        const payload = {
            name,
            phone: form.phone.value.trim() || null,
            email: form.email.value.trim() || null,
            availability: form.availability.value,
            skills: Array.from(form.querySelectorAll('input[name="skills"]:checked'))
                .map((input) => input.value),
        };

        submitBtn.disabled = true;
        submitBtn.textContent = 'Registering…';

        /* NOTE: /volunteers/register does not exist on the gateway yet, so this
           will queue in the outbox and replay automatically once the endpoint
           is implemented. Nothing the user types is lost in the meantime. */
        const result = await api.post('/volunteers/register', payload);

        submitBtn.disabled = false;
        submitBtn.textContent = 'Register';

        feedback.innerHTML = result.queued
            ? `<div class="panel border-warning-500/30 bg-warning-500/5 px-4 py-3">
                   <p class="text-body-sm text-warning-400">
                       Saved on this device. It will send once the gateway is reachable.
                   </p>
               </div>`
            : `<div class="panel border-rescue-500/30 bg-rescue-500/5 px-4 py-3">
                   <p class="text-body-sm text-rescue-400">Volunteer registered.</p>
               </div>`;

        form.reset();
        paintList(container);
    });

    paintList(container);
}

function paintList(container) {
    const list = container.querySelector('#v-list');
    if (!list) return;

    const pending = outbox.all().filter((item) => item.endpoint === '/volunteers/register');

    if (pending.length === 0) {
        list.innerHTML = emptyState(
            'No volunteers registered yet.',
            'The volunteer endpoint is not implemented on the gateway yet.'
        );
        return;
    }

    list.innerHTML = `<ul>${pending.map((item) => `
        <li class="px-5 py-4 border-b border-hairline last:border-0
                   flex items-center justify-between gap-4">
            <div class="min-w-0">
                <p class="text-body-sm text-ink truncate">${escapeHtml(item.data?.name || '')}</p>
                <p class="text-caption text-ink-subtle mt-1">
                    ${escapeHtml((item.data?.skills || []).join(', ') || 'No skills listed')}
                </p>
            </div>
            <span class="pill-warning shrink-0">Pending</span>
        </li>`).join('')}</ul>`;
}
