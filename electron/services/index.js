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
const IS_SLAVE_FILENAME = path.join(DATA_BASE_DIR, 'slave_mode');

async function init(){
    const mysqlBaseDir = path.join(DATA_BASE_DIR, 'mysql');
    await FileExtractor.prepareFolder(DATA_BASE_DIR);
    FileExtractor.init(DATA_BASE_DIR);
    MysqlServer.init(mysqlBaseDir);
    RemoteData.init(DATA_BASE_DIR);
    Updater.init(DATA_BASE_DIR);
}

async function setup(){
    console.log("Setting up Mysql Server...")
    await MysqlServer.setup();
    await sleep(200);
    await MysqlServer.start();
    await sleep(10000); // Giving time to mysql server to start listening
    await MysqlServer.prepare();
    await sleep(200);
    console.log("Initializing Database...")
    const [sqlFile] = await FileExtractor.extractIfNotExist(['vendor_db_template.sql'])
    console.log('sqlFile', sqlFile)
    await MysqlServer.importDatabase('restopos', sqlFile);
    await sleep(200);
    console.log("Writing check file...")
    await fs.writeFile(CHECK_FILENAME, '1');
}

async function start(){
    await MysqlServer.start();
}

async function setupUserMode(){
    await fs.writeFile(IS_SLAVE_FILENAME, '1');
    await fs.writeFile(CHECK_FILENAME, '1');
}

async function isFirstLaunch(){
    return !(await FileExtractor.fileExist(CHECK_FILENAME));
}

function isSlaveMode(){
    return FileExtractor.fileExist(IS_SLAVE_FILENAME)
}

module.exports = {
    MysqlServer,
    init,
    setup,
    setupSlave: setupUserMode,
    start,
    isFirstLaunch,
    RemoteData,
    isSlaveMode,
}