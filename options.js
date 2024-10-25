// options.js
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('configForm');
    const statusEl = document.getElementById('status');

    // Load saved settings
    chrome.storage.local.get(['tenantId', 'token'], (result) => {
        if (result.tenantId) {
            document.getElementById('tenantId').value = result.tenantId;
        }
        if (result.token) {
            document.getElementById('token').value = result.token;
        }
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const tenantId = document.getElementById('tenantId').value.trim();
        const token = document.getElementById('token').value.trim();

        try {
            // Validate input
            if (!tenantId || !token) {
                throw new Error('Both Tenant ID and Token are required');
            }

            // Test connection to Observe
            const testEndpoint = `https://${tenantId}.collect.observeinc.com/v1/http`;
            const testResponse = await fetch(testEndpoint, {
                method: 'OPTIONS',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!testResponse.ok) {
                throw new Error('Failed to validate credentials');
            }

            // Save settings
            await chrome.storage.local.set({ tenantId, token });

            // Show success message
            statusEl.textContent = 'Configuration saved successfully!';
            statusEl.className = 'status success';

        } catch (error) {
            statusEl.textContent = `Error: ${error.message}`;
            statusEl.className = 'status error';
        }

        // Clear status after 5 seconds
        setTimeout(() => {
            statusEl.className = 'status';
        }, 5000);
    });
});