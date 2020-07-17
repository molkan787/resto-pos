const { spawnLiveOutput, path, sleep, cp, rimraf } = require('./helpers');
const watch = require('node-watch');
const nodePath = require('path');

let electronLaunched = false;
async function run(){
    const flags = getFlags();
    if(!flags['skip-vue']){
        await startVueServe();
    }
    await copyServerFiles();
    await sleep(500);
    await launchElectron();
    console.log('DONE!');
    process.exit(0);
}

function startVueServe(){
    const otherArgs = []; //['--mode', 'production'];
    return new Promise(resolve => {
        console.log('Compiling Vue App...');
        spawnLiveOutput({
            cwd: path('apos_v'),
            cmd: 'cmd',
            args: ['/c', path('apos_v', 'node_modules', '.bin', 'vue-cli-service.cmd'), 'serve', ...otherArgs],
            printTitle: 'VUE SERVE',
        }, data => {
            if(!electronLaunched && data.includes('Version: typescript')){
                electronLaunched = true;
                resolve();
            }
        });
    })
}

async function copyServerFiles(){
    console.log('Copying Server files...');
    const src = path('Server');
    const dest = path('electron', 'server');
    await rimraf(dest);
    await cp(src, dest);

    console.log('Watching Server files...');
    watch(src, { recursive: true }, (event, name) => {
        const relativeName = name.substr(src.length);
        const destName = path('electron', 'server', relativeName);
        cp(name, destName);
    })
}

function launchElectron(){
    console.log('Launching Electron...');
    const spawnElectron = () => spawnLiveOutput({
        cwd: path('electron'),
        cmd: 'cmd',
        args: ['/c', path('electron', 'node_modules', '.bin', 'electron'), '.'],
        printTitle: 'ELECTRON',
    });
    let electron = spawnElectron();
    const toWatch = [
        path('electron', 'server'),
        path('electron', 'services'),
        path('electron', 'main.js'),
        path('electron', 'server.js'),
    ];
    watch(toWatch, { recursive: true }, async (event, name) => {
        if(nodePath.extname(name) == '.js'){
            console.log('Restarting Electron...')
            electron.kill();
            await sleep(100);
            electron = spawnElectron();
        }
    })
    return new Promise(() => 0);
}

function getFlags(){
    const flags = {};
    for(let arg of process.argv){
        if(arg.startsWith('--')){
            flags[arg.substr(2)] = true;
        }
    }
    return flags;
}

run();