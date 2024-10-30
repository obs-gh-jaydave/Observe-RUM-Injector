(function() {
    console.log('[APM Init] Starting initialization process');

    function initializeApm() {
        console.log('[APM Init] Checking dependencies:', {
            hasConfig: !!window.OBSERVE_CONFIG,
            hasApm: !!window.elasticApm
        });

        if (!window.OBSERVE_CONFIG || !window.elasticApm) {
            console.log('[APM Init] Missing dependencies, retrying in 100ms');
            setTimeout(initializeApm, 100);
            return;
        }

        const config = window.OBSERVE_CONFIG;
        console.log('[APM Init] Initializing APM with config');
        
        try {
            // Get user agent info
            const userAgent = window.navigator.userAgent;
            const nav = window.navigator;

            // Initialize APM
            elasticApm.init({
                serviceName: 'eStore',
                serverUrl: `https://${config.tenantId}.collect.observeinc.com`,
                apmRequest: ({ xhr, headers }) => {
                    xhr.setRequestHeader('Authorization', `Bearer ${config.token}`);
                    return true;
                },
                // Enable more default collection
                distributedTracing: true,
                distributedTracingOrigins: ['*'],
                propagateTracestate: true,
                // Capture more performance metrics
                breakdownMetrics: true,
                monitorLongtasks: true
            });

            console.log('[APM Init] APM initialized successfully');

            // Add additional browser context via labels
            elasticApm.addLabels({
                'browser.name': nav.appName,
                'browser.version': nav.appVersion,
                'browser.mobile': /Mobile|Android|iOS|iPhone|iPad|iPod/i.test(nav.userAgent),
                'browser.platform': nav.platform,
                'browser.language': nav.language,
                'screen.width': window.screen.width,
                'screen.height': window.screen.height,
                'screen.density': window.devicePixelRatio,
                'device.orientation': screen.orientation?.type || 'unknown'
            });

            // Add custom context
            elasticApm.setCustomContext({
                userAgent: userAgent,
                browser: {
                    name: navigator.appName,
                    platform: navigator.platform,
                    version: navigator.appVersion,
                    language: navigator.language
                },
                screen: {
                    width: window.screen.width,
                    height: window.screen.height,
                    orientation: window.screen.orientation?.type || 'unknown'
                }
            });

            // Create a page load transaction
            const transaction = elasticApm.startTransaction('page-load', 'page-load');
            
            // Add initialization span
            const span = transaction.startSpan('init-process', 'custom');
            if (span) {
                span.end();
            }
            
            // End transaction after page load
            window.addEventListener('load', () => {
                setTimeout(() => {
                    transaction.end();
                    console.log('[APM Init] Page load transaction ended');
                }, 1000);
            });

        } catch (error) {
            console.error('[APM Init] Error during initialization:', error);
        }
    }

    // Start initialization process
    window.addEventListener('OBSERVE_CONFIG_SET', () => {
        console.log('[APM Init] Config set, starting initialization');
        initializeApm();
    });

    // Also try to initialize immediately in case config is already set
    initializeApm();
})();