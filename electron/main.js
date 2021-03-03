const package = require('./package.json');
const DEV = !!package.build;
console.log('DEV', DEV)
global.DEV = DEV;
global.APP_VERSION = package.version;

const config = require('./config');
const { app, BrowserWindow, dialog, remote } = require('electron')
const path = require('path');

global.TempDir = path.join(app.getPath('temp'), 'resto-pos')
const DownloadManager = require("electron-download-manager")
const server = require('./server');
const services = require('./services');
const backendServer = require(DEV ? '../server/index' : './server/index');
const updater = require('./services/updater');

const port = DEV ? 8080 : 8083;

let win

function createWindow() {
  win = new BrowserWindow({
    width: 800, height: 600, 'min-width': 1000, 'min-height': 600, webPreferences: {
      nodeIntegration: true,
      webSecurity: false,
    }, show: false
  });
  win.setMenu(null);

  win.loadURL(`http://localhost:${port}/`)

  win.webContents.on('did-finish-load', function () {
    win.maximize();
    win.setMinimumSize(1000, 600);
    win.show();
  });
  win.webContents.on('ipc-message', (event, channel, data) => handleWindowIpcMessage(channel, data));
  if (DEV) win.webContents.openDevTools()


  win.on('closed', () => {
    win = null;
    app.quit();
  })
  
  updater.setUiWindow(win);
}

function createSetupWindow(){
  win = new BrowserWindow({
    width: 800, height: 600,
    resizable: false,
    maximizable: false,
    show: false,
    webPreferences: {
      nodeIntegration: true,
    }
  });
  win.setMenu(null);
  win.webContents.on('did-finish-load', () => win.show());
  win.loadFile('login.html')
  win.webContents.on('ipc-message', (event, channel, data) => handleWindowIpcMessage(channel, data));
  if (DEV) win.webContents.openDevTools()
}

function init() {
  global.slave_mode = false;
  startServices();
  DownloadManager.register({ downloadFolder: app.getPath("desktop") + "/POS REPORTS" });
}

function showUI(showSetupWindow){
  if(showSetupWindow){
    createSetupWindow();
  }else{
    if (DEV) {
      createWindow();
    } else {
      server.on('error', err => console.error(err));
      server.listen(port, function () {
        console.log('Views Server listening at %s', server.name, server.url);
        createWindow();
      });
    }
  }
}

async function startServices(){
  await services.init();
  const firstlaunch = await services.isFirstLaunch();
  const isSlaveMode = await services.isSlaveMode();
  global.slave_mode = isSlaveMode;
  showUI(firstlaunch);

  console.log('firstlaunch:', firstlaunch);
  console.log('isSlaveMode:', isSlaveMode);

  if(firstlaunch || isSlaveMode) return;
  console.log('Starting services...');
  await services.start();
  const remoteDB = await services.RemoteData.getRemoteDatabaseConfig();
  backendServer({
    localMysqlServerPort: services.MysqlServer.PORT,
    remoteDBConfig: {
      host: config.master_host,
      user: remoteDB.user,
      password: remoteDB.password,
      database: remoteDB.name
    }
  })
}

async function doSetup(slaveMode){
  console.log('Setting up services...' + (slaveMode ? ' (Slave Mode)' : ''));
  try {
    if(slaveMode){
      await services.setupSlave();
    }else{
      await services.setup();
    }
    console.log('Setup completed!');
    app.relaunch();
  } catch (error) {
    console.error(error);
    console.log('Services setup failed');
    dialog.showMessageBoxSync(win, {
      type: 'error',
      title: 'Setup',
      message: 'An error occured, Please relaunch the app to try again.',
    })
  }finally{
    app.exit(0);
  }
}


function handleWindowIpcMessage(channel, data){
  console.log('ipc message:', channel, data);
  if(channel == 'login'){
    handleUserLogin(data);
  }else if(channel == 'update'){
    updater.handle(data);
  }else if(channel == 'setup_slave'){
    doSetup(true);
  }
}

async function handleUserLogin(data){
  try {
    const success = await services.RemoteData.getDataBaseDump(data);
    if(success){
      console.log('DB dump downloaded successfully, Start setup...');
      win.loadFile('setup_wait.html');
      doSetup();
    }else{
      win.webContents.executeJavaScript('loginFailed()');
    }
  } catch (error) {
    win.webContents.executeJavaScript('loginError()');
    console.error(error);
  }
}

app.on('ready', init)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.exit(0);
  }
})

app.on('activate', () => {
  if (win === null) {
    createWindow()
  }
})