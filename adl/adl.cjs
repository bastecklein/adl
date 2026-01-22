/**
 * CommonJS wrapper for Node.js projects without webpack
 * Provides access to ADL exports without requiring browser/DOM globals
 */

let adlModule = null;

function getADLModule() {
    if (adlModule) {
        return adlModule;
    }

    try {
        // Dynamic import of ESM module for CommonJS compatibility
        adlModule = import('./adl.js').then(module => {
            // Re-export all named exports
            return module;
        }).catch(err => {
            console.error('Failed to load ADL module:', err);
            throw err;
        });
        
        return adlModule;
    } catch (err) {
        console.error('Error loading ADL CommonJS wrapper:', err);
        throw err;
    }
}

// Create async wrapper for CommonJS
module.exports = new Promise((resolve, reject) => {
    import('./adl.js').then(module => {
        // Wrap exports in CommonJS-compatible format
        const wrapper = {
            // Re-export all named exports
            ...module,
            default: module.default,
            // Include common exports for ease of use
            COMMON_FLUENT_ICONS: module.COMMON_FLUENT_ICONS,
            setTheme: module.setTheme,
        };
        resolve(wrapper);
    }).catch(reject);
});
