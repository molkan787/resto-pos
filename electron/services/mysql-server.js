const path = require('path');
const { promises: fs } = require('fs');
const { exec } = require('child_process');
const FileExtractor = require('./file-extractor');
const { sleep, rimraf } = require('./utils');

module.exports = class MysqlServer{

    static get PORT(){ return 47473; }
    
    static init(baseDir){
        this.baseDir = baseDir;
        this.vendorDir = path.join(baseDir, 'mysql-community');
        this.binariesDir = path.join(this.vendorDir, 'bin');
        this.daemonBinary = path.join(this.binariesDir, 'mysqld.exe');
        this.clientBinary = path.join(this.binariesDir, 'mysql.exe');
        this.configFilename = path.join(this.baseDir, 'config.ini');
        this.serverProcess = null;
    }

    static async clean(){
        exec('taskkill /f /im mysqld.exe /t');
        await sleep(2000);
        await rimraf(this.baseDir);
    }

    static async prepare(){
        await this._execMysqlClient(['-e', `"ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY ''"`]);
        await this._execMysqlClient(['-e', `"flush privileges;"`]);
    }

    static async importDatabase(dbName, sqlFile){
        await this._execMysqlClient(['-e', `"create database ${dbName}"`]);
        await this._execMysqlClient([dbName, '<', sqlFile]);
    }

    static async setup(){
        await this.clean();
        await FileExtractor.prepareFolder(this.baseDir);
        await FileExtractor.extractArchive('mysql-server.zip', this.vendorDir);
        await this._writeConfigFile();
        await sleep(200);
        await this._initMysqlServer();
    }

    static async start(){
        this.serverProcess = this._spawnServerDeamon([]);
        await sleep(500);
    }

    static async _writeConfigFile(){
        const content = this._getConfigFileContent();
        await fs.writeFile(this.configFilename, content);
    }

    static _initMysqlServer(){
        return new Promise((resolve, reject) => {
            const args = ['--initialize-insecure', '--console'];
            const child = this._spawnServerDeamon(args);
            child.on('exit', code => code == 0 ? resolve() : reject('mysqld exited with code ' + code));
        })
    }

    static _spawnServerDeamon(args){
        const configFilename = this._escapeBackslashes(this.configFilename);
        const configArg = `--defaults-file="${configFilename}"`;
        const cmd = this.daemonBinary + ' ' + [configArg, ...args].join(' ');
        console.log(cmd)
        return exec(cmd);
    }

    static _execMysqlClient(args){
        return new Promise((resolve, reject) => {
            const cmd = [
                this.clientBinary,
                '--port', this.PORT,
                '-u root',
                ...args
            ].join(' ');
            exec(cmd, err => err ? reject(err) : resolve());
        })
    }

    static _escapeBackslashes(str){
        return str.replace(/\\/g, '\\\\');
    }

    static _getConfigFileContent(){
        const dataDir = path.join(this.baseDir, 'data');
        const logsDir = path.join(this.baseDir, 'logs');
        return `
        [mysqld]
        sql_mode = NO_ENGINE_SUBSTITUTION,STRICT_TRANS_TABLES
        basedir = "${this.vendorDir}"
        datadir = "${dataDir}"
        port = "${this.PORT}"
        log-error = "${logsDir}"
        
        [mysqladmin]
        
        user = "root"
        port = "${this.PORT}"
        `;
    }

}