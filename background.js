// Basic message handling
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'GET_APM_CONFIG') {
        chrome.storage.local.get(['tenantId', 'token'], sendResponse);
        return true;
    }
    
    if (message.type === 'SEND_TELEMETRY') {
        chrome.storage.local.get(['tenantId', 'token'], (result) => {
            const { tenantId, token } = result;
            const observeEndpoint = `https://${tenantId}.collect.observeinc.com/v1/http`;
            
            fetch(observeEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'X-Observe-RUM': 'true'
                },
                body: JSON.stringify(message.data)
            })
            .then(response => response.text())
            .then(data => sendResponse({ success: true, data }))
            .catch(error => sendResponse({ success: false, error: error.message }));
        });
        return true;
    }
});

// Installation handler
chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.get(['tenantId', 'token'], (result) => {
        if (!result.tenantId || !result.token) {
            chrome.runtime.openOptionsPage();
        }
    });
});