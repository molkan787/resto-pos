// @ts-nocheck
import compareVersions from 'compare-versions';
import axios from 'axios';
const config = getGlobal('main_config');
const APP_VERSION = getGlobal('APP_VERSION');
const API_BASE_URL = config.master_api_url;

export default class Updater{

    private static retryIn = 15;

    static async checkForUpdates(){
        try {
            const url = `${API_BASE_URL}/updates`;
            const { data } = await axios.get(url);
            const currentAppVersion = data.currentAppVersion.trim();
            if(compareVersions(currentAppVersion, APP_VERSION) !== 0){
                this.promptUpdateDownload(currentAppVersion);
            }
        } catch (error) {
            console.error(error);
            this.scheduleUpdateCheck();
        }
    }

    static async promptUpdateDownload(updateVersion){
        const e = await ask('An update is available, Do you want to download it now?', 'Update Available!');
        e.hide();
        if(e.answer){
            this.downloadUpdate(updateVersion);
            setTimeout(() => {
                info('The update started downloading, You will get notified once it completes.').then(e => e.hide());
            }, 1000);
        }
    }

    static downloadUpdate(updateVersion){
        electron.ipcRenderer.send('update', {
            action: 'download',
            updateVersion,
        })
        showDownloadStatus();
    }

    static scheduleUpdateCheck(){
        setTimeout(() => this.checkForUpdates(), 1000 * 60 * this.retryIn);
        this.retryIn *= 2;
    }

    static async _promptUserForInstall(){
        hideDownloadStatus();
        const e = await ask('The update has been download and it is ready to install, Do you want to restart the app and install the update now?', 'Update Downloaded!');
        if(e.answer){
            e.loading();
        }else{
            e.hide();
        }
        return e.answer;
    }

}
window.Updater = Updater;
setTimeout(() => Updater.checkForUpdates(), 1000 * 20);