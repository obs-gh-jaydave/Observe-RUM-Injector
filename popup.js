// popup.js
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('settingsForm');
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
            statusEl.textContent = 'Settings saved successfully!';
            statusEl.className = 'status success';

            // Reload active tabs to apply new settings
            chrome.tabs.query({ active: true }, (tabs) => {
                tabs.forEach(tab => {
                    chrome.tabs.reload(tab.id);
                });
            });

        } catch (error) {
            statusEl.textContent = `Error: ${error.message}`;
            statusEl.className = 'status error';
        }

        // Clear status after 3 seconds
        setTimeout(() => {
            statusEl.className = 'status';
        }, 3000);
    });
});