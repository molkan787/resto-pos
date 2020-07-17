const path = require('path');
const axios = require('axios');
const fs = require('fs').promises;
const { downloadFile } = require('./utils');

const HOST = global.DEV ? '127.0.0.1' : '142.93.43.100:85';
const REMOTE_URL = `http://${HOST}/client/`;
module.exports = class RemoteData{

    static init(dataDir){
        this.dataDir = dataDir;
        this.authURL = REMOTE_URL + 'auth';
        this.downloadURL = REMOTE_URL + 'get_db_dump';
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