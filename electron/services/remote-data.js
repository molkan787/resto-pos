const path = require('path');
const axios = require('axios');
const fs = require('fs').promises;
const { downloadFile } = require('./utils');

const REMOTE_URL = global.main_config.master_api_url;
module.exports = class RemoteData{

    static init(dataDir){
        this.dataDir = dataDir;
        this.authURL = REMOTE_URL + '/auth';
        this.downloadURL = REMOTE_URL + '/get_db_dump';
        this.filename = '';
        this.remoteDbConfigFilename = path.join(dataDir, 'rdbconf');
    }

    static async getDataBaseDump(login_details){
        try {
            const { token, database } = (await axios.post(this.authURL, login_details)).data;
            await this.setRemoteDatabaseConfig(database);
            const filename = path.join(this.dataDir, 'remote_db_dump');
            const downloadURL = `${this.downloadURL}?token=${token}`;
            await downloadFile(downloadURL, filename);
            this.filename = filename;
            return true;
        } catch (error) {
            if(error.response && error.response.status == 401){
                return false;
            }else{
                throw error;
            }
        }
    }

    static setRemoteDatabaseConfig(details){
        return fs.writeFile(this.remoteDbConfigFilename, JSON.stringify(details));
    }

    static async getRemoteDatabaseConfig(){
        const rawData = await fs.readFile(this.remoteDbConfigFilename, 'utf8');
        return JSON.parse(rawData);
    }

}