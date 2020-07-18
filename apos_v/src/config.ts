// @ts-nocheck
// const electron = require('electron');
const DEV = electron.remote.getGlobal('DEV');
const config = {
    debug: DEV,
    devMode: DEV,
    demoMode: false,
    localSettingsKey: 'cwpos_settings',

    app: {
        currencySign: '£'
    }
};
console.log('devMode', config.devMode);
// @ts-ignore
if(config.debug) window.printToConsole = true;
export default config;