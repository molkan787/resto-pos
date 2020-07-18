const path = require('path');
const FileExtractor = require('./file-extractor');
const { downloadFile, spawnDetached } = require('./utils');
const DL_BASE_URL = global.main_config.dl_base_url;
module.exports = class Updater{

    static setUiWindow(window){
        this.execJsInUI = jscode => window.webContents.executeJavaScript(jscode);
    }

    static init(dataDir){
        this.downloadsDir = path.join(dataDir, 'downloads');
    }

    static handle(data){
        const { action, updateVersion } = data;
        if(action == 'download'){
            this.handleDownloadUpdate(updateVersion);
        }
    }

    static async handleDownloadUpdate(updateVersion){
        try {
            console.log('Downloading update...');
            const installerFilename = await this.downloadUpdate(updateVersion);
            console.log('Update downloaded!');
            if(await this.promptUserForInstall()){
                console.log('Installing update');
                this.installUpdate(installerFilename);
            }else{
                onsole.log('Update aborded by the user.');
            }
        } catch (error) {
            console.error(error);
        }
    }

    static async downloadUpdate(updateVersion){
        await FileExtractor.prepareFolder(this.downloadsDir);
        const filename = `app-${updateVersion}.exe`;
        const pathname = path.join(this.downloadsDir, filename);
        const dl = `${DL_BASE_URL}/apps/${filename}`;
        await downloadFile(dl, pathname);
        return pathname;
    }

    static installUpdate(installerFilename){
        spawnDetached('cmd', [
            '/c',
            'echo Updating POS App...',
            '&&',
            'timeout 5',
            '&&',
            installerFilename
        ]);
        setTimeout(() => process.exit(0), 3000);
    }

    static promptUserForInstall(){
        try {
            return this.execJsInUI('Updater._promptUserForInstall()');
        } catch (error) {
            return false;
        }
    }

}