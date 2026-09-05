// SOS Form module - STUB
// 
// TODO: Implement:
// - SOS submission form (name, contact, location, severity, description, photo)
// - Photo capture/upload (use camera API for offline use)
// - GPS auto-fill if available
// - Submission with offline queue support
// - List of recent SOS reports

export function render(container) {
    // TODO: Build SOS form and list
    container.innerHTML = `
        <div class="max-w-2xl mx-auto">
            <h2 class="text-2xl font-bold mb-4">SOS Report</h2>
            <form id="sos-form" class="bg-white p-6 rounded shadow">
                <div class="mb-4">
                    <label class="block text-gray-700 mb-2">Your Name</label>
                    <input type="text" name="reporter_name" class="w-full p-2 border rounded">
                </div>
                <div class="mb-4">
                    <label class="block text-gray-700 mb-2">Contact</label>
                    <input type="text" name="reporter_contact" class="w-full p-2 border rounded">
                </div>
                <div class="mb-4">
                    <label class="block text-gray-700 mb-2">Severity</label>
                    <select name="severity" class="w-full p-2 border rounded">
                        <option value="low">Low</option>
                        <option value="medium" selected>Medium</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                    </select>
                </div>
                <div class="mb-4">
                    <label class="block text-gray-700 mb-2">Description</label>
                    <textarea name="description" class="w-full p-2 border rounded" rows="4"></textarea>
                </div>
                <button type="submit" class="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700">Submit SOS</button>
            </form>
        </div>
    `;
}