const { app } = require('electron');
const path =  require('path');
const { promises: fs } = require('fs');
const { sleep } = require('./utils');
const FileExtractor = require('./file-extractor');
const MysqlServer = require('./mysql-server');
const RemoteData = require('./remote-data');
const Updater = require('./updater');

const DATA_BASE_DIR = app.getPath('userData');
const CHECK_FILENAME = path.join(DATA_BASE_DIR, 'setup_done');

async function init(){
    const mysqlBaseDir = path.join(DATA_BASE_DIR, 'mysql');
    await FileExtractor.prepareFolder(DATA_BASE_DIR);
    FileExtractor.init(DATA_BASE_DIR);
    MysqlServer.init(mysqlBaseDir);
    RemoteData.init(DATA_BASE_DIR);
    Updater.init(DATA_BASE_DIR);
}

async function setup(){
    await MysqlServer.setup();
    await sleep(200);
    await MysqlServer.start();
    await sleep(10000); // Giving time to mysql server to start listening
    await MysqlServer.prepare();
    await sleep(200);
    const sqlFile = RemoteData.filename;
    await MysqlServer.importDatabase('restopos', sqlFile);
    await sleep(200);
    await fs.writeFile(CHECK_FILENAME, '1');
}

async function start(){
    await MysqlServer.start();
}

async function isFirstLaunch(){
    return !(await FileExtractor.fileExist(CHECK_FILENAME));
}

module.exports = {
    MysqlServer,
    init,
    setup,
    start,
    isFirstLaunch,
    RemoteData,
}