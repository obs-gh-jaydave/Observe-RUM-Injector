(function() {
    console.log('[Content] Script initialized');

    function injectScript(src) {
        console.log('[Content] Injecting script:', src);
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = () => {
                console.log('[Content] Script loaded:', src);
                resolve();
            };
            script.onerror = (error) => {
                console.error('[Content] Script failed to load:', src, error);
                reject(error);
            };
            (document.head || document.documentElement).appendChild(script);
        });
    }

    function setConfig(config) {
        window.postMessage({
            type: 'OBSERVE_SET_CONFIG',
            config: config
        }, '*');
    }

    async function initialize() {
        console.log('[Content] Starting initialization');
        try {
            // Get configuration from background script
            console.log('[Content] Requesting config from background');
            const config = await new Promise(resolve => 
                chrome.runtime.sendMessage({ type: 'GET_APM_CONFIG' }, resolve)
            );

            console.log('[Content] Received config:', {
                hasTenantId: !!config.tenantId,
                hasToken: !!config.token
            });

            if (!config.tenantId || !config.token) {
                throw new Error('Missing configuration');
            }

            // First inject the config setter
            await injectScript(chrome.runtime.getURL('config-setter.js'));

            // Set the config
            setConfig(config);

            // Then inject the APM script
            await injectScript(chrome.runtime.getURL('elastic-apm-rum.umd.min.js'));

            // Finally inject the initialization script
            await injectScript(chrome.runtime.getURL('apm-init.js'));

        } catch (error) {
            console.error('[Content] Failed to initialize:', error);
        }
    }

    // Listen for telemetry data
    window.addEventListener('message', (event) => {
        if (event.data?.type === 'OBSERVE_TELEMETRY') {
            console.log('[Content] Received telemetry data:', event.data);
            chrome.runtime.sendMessage({
                type: 'SEND_TELEMETRY',
                data: event.data.data
            }, response => {
                console.log('[Content] Telemetry send response:', response);
            });
        }
    });

    // Start initialization
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }
})();