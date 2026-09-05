// Dashboard module - STUB
// 
// TODO: Implement:
// - Overview cards (active nodes, SOS count, volunteers, resources)
// - Live map with node locations
// - Recent activity feed
// - Alert notifications

export function render(container) {
    // TODO: Build dashboard UI dynamically
    container.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div class="bg-white p-4 rounded shadow">
                <h3 class="font-semibold text-gray-600">Active Nodes</h3>
                <p class="text-3xl font-bold text-blue-600">0</p>
            </div>
            <div class="bg-white p-4 rounded shadow">
                <h3 class="font-semibold text-gray-600">Active SOS</h3>
                <p class="text-3xl font-bold text-red-600">0</p>
            </div>
            <div class="bg-white p-4 rounded shadow">
                <h3 class="font-semibold text-gray-600">Volunteers</h3>
                <p class="text-3xl font-bold text-green-600">0</p>
            </div>
            <div class="bg-white p-4 rounded shadow">
                <h3 class="font-semibold text-gray-600">Resources</h3>
                <p class="text-3xl font-bold text-orange-600">0</p>
            </div>
        </div>
    `;
}