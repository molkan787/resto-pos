const copy = require('recursive-copy');
const rm = require('rimraf');
const { exec, path, replaceInTextFile } = require('./helpers');

async function run(){
    console.log('Building Vue App...')
    await exec('cd apos_v && yarn build')

    console.log('Copying build files to electron app')
    rm.sync(path('electron', 'app'))
    await copy(path('apos_v', 'dist'), path('electron', 'app'))

    console.log('Preparing index.html ...')
    await replaceInTextFile(path('electron', 'app', 'index.html'), new RegExp('=/', 'g'), '=./');
    
    console.log('Copying server files...')
    rm.sync(path('electron', 'server'))
    await copy(path('server'), path('electron', 'server'))

    console.log('Building Electron app...')
    await exec('cd electron && yarn build')

    console.log('Build done!');
}

run();