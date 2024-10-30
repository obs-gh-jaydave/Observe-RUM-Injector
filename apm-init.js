(function() {
    console.log('[APM Init] Starting initialization process');

    function getBrowserInfo() {
        const uaData = navigator.userAgentData || {};
        const brands = uaData.brands || [];
        const ua = navigator.userAgent;
        
        // Modern browser detection
        const browserInfo = {
            name: brands[0]?.brand || getBrowserNameFromUA(ua),
            version: brands[0]?.version || getBrowserVersionFromUA(ua),
            mobile: uaData.mobile || isMobileFromUA(ua),
            platform: uaData.platform || getPlatformFromUA(ua),
            language: navigator.language,
        };

        return browserInfo;
    }

    // Fallback functions for older browsers
    function getBrowserNameFromUA(ua) {
        const browsers = {
            'Chrome': /Chrome\/(\d+)/,
            'Firefox': /Firefox\/(\d+)/,
            'Safari': /Safari\/(\d+)/,
            'Edge': /Edg\/(\d+)/,
            'Opera': /OPR\/(\d+)/
        };
        
        for (const [name, regex] of Object.entries(browsers)) {
            if (regex.test(ua)) return name;
        }
        return 'Unknown';
    }

    function getBrowserVersionFromUA(ua) {
        const match = ua.match(/(Chrome|Firefox|Safari|Edge|OPR)\/(\d+)/);
        return match ? match[2] : 'Unknown';
    }

    function isMobileFromUA(ua) {
        return /Mobile|Android|iOS|iPhone|iPad|iPod/i.test(ua);
    }

    function getPlatformFromUA(ua) {
        if (/Windows/.test(ua)) return 'Windows';
        if (/Macintosh/.test(ua)) return 'macOS';
        if (/Linux/.test(ua)) return 'Linux';
        if (/Android/.test(ua)) return 'Android';
        if (/iPhone|iPad|iPod/.test(ua)) return 'iOS';
        return 'Unknown';
    }

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
            // Get browser information
            const browserInfo = getBrowserInfo();
            
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

            // Add browser information as labels
            elasticApm.addLabels({
                'browser.name': browserInfo.name,
                'browser.version': browserInfo.version,
                'browser.mobile': browserInfo.mobile,
                'browser.platform': browserInfo.platform,
                'browser.language': browserInfo.language,
                'screen.width': window.screen.width,
                'screen.height': window.screen.height,
                'screen.density': window.devicePixelRatio,
                'device.orientation': screen.orientation?.type || 'unknown'
            });

            // Add detailed context
            elasticApm.setCustomContext({
                browser: browserInfo,
                screen: {
                    width: window.screen.width,
                    height: window.screen.height,
                    density: window.devicePixelRatio,
                    orientation: screen.orientation?.type || 'unknown'
                },
                viewport: {
                    width: window.innerWidth,
                    height: window.innerHeight
                },
                connection: navigator.connection ? {
                    type: navigator.connection.effectiveType,
                    downlink: navigator.connection.downlink,
                    rtt: navigator.connection.rtt
                } : undefined
            });

            // Create a page load transaction
            const transaction = elasticApm.startTransaction('page-load', 'page-load');
            
            // Add initialization span
            const span = transaction.startSpan('init-process', 'custom');
            if (span) {
                // Add browser info to span
                span.addLabels({
                    'init.browser': browserInfo.name,
                    'init.platform': browserInfo.platform
                });
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