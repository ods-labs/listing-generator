module.exports = {
    /* corePlugins: {
        preflight: false,
    }, */
    future: {
        purgeLayersByDefault: true,
        removeDeprecatedGapUtilities: true,
    },
    purge: {
        content: [
            "./src/**/*.svelte",
        ],
        enabled: true // production // disable purge in dev
    },
};