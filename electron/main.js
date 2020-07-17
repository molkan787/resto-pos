const package = require('./package.json');
const DEV = !!package.build;
console.log('DEV', DEV)
global.DEV = DEV;

const { app, BrowserWindow, dialog, remote } = require('electron')
const DownloadManager = require("electron-download-manager")
const server = require('./server');
const services = require('./services');
const backendServer = require('./server/index');

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

  if (DEV) win.webContents.openDevTools()


  win.on('closed', () => {
    win = null;
    app.quit();
  })
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
  win.webContents.on('ipc-message', (event, channel, data) => handleUserLogin(data));
  win.loadFile('login.html')
  if (DEV) win.webContents.openDevTools()
}

function init() {
  startServices().then(async () => {
    const remoteDB = await services.RemoteData.getRemoteDatabaseConfig();
    backendServer({
      localMysqlServerPort: services.MysqlServer.PORT,
      remoteDBConfig: {
        host: DEV ? '192.168.1.4' : '142.93.43.100',
        user: remoteDB.user,
        password: remoteDB.password,
        database: remoteDB.name
      }
    })
  })
  DownloadManager.register({ downloadFolder: app.getPath("desktop") + "/POS REPORTS" })
}

function showUI(showSetupWindow){
  if(showSetupWindow){
    createSetupWindow();
    return;
  }
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

async function startServices(){
  await services.init();
  const firstlaunch = await services.isFirstLaunch();
  showUI(firstlaunch);
  if(!firstlaunch){
    console.log('Starting services...');
    await services.start();
  }
}

async function doSetup(){
  console.log('Setting up services...');
  try {
    await services.setup();
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