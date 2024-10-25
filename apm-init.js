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
            elasticApm.init({
                serviceName: 'eStore',
                serverUrl: `https://${config.tenantId}.collect.observeinc.com`,
                apmRequest: ({ xhr, headers }) => {
                    xhr.setRequestHeader('Authorization', `Bearer ${config.token}`);
                    return true;
                }
            });

            console.log('[APM Init] APM initialized successfully');

            // Create a test transaction
            const transaction = elasticApm.startTransaction('page-load', 'page-load');
            
            // Add some spans
            const span = transaction.startSpan('init-process', 'custom');
            if (span) {
                span.end();
            }
            
            // End transaction after a delay
            setTimeout(() => {
                transaction.end();
                console.log('[APM Init] Test transaction ended');
            }, 1000);

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