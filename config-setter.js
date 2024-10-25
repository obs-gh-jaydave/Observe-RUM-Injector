(function() {
    console.log('[Config] Starting configuration setup');
    
    // Listen for configuration from content script
    window.addEventListener('message', function(event) {
        if (event.data?.type === 'OBSERVE_SET_CONFIG') {
            console.log('[Config] Received config data');
            window.OBSERVE_CONFIG = event.data.config;
            
            // Dispatch event to notify config is set
            window.dispatchEvent(new CustomEvent('OBSERVE_CONFIG_SET'));
        }
    });

    console.log('[Config] Event listener registered');
})();