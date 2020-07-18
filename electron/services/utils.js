const fs = require('fs');
const request = require('request');
const rimraf = require('rimraf');
const { spawn } = require('child_process');
module.exports.sleep = function (time){
    return new Promise(resolve => setTimeout(resolve, time));
}

module.exports.downloadFile = (url, savePath) => new Promise((resolve, reject) => {
    request(url).on('error', reject)
                .pipe(fs.createWriteStream(savePath))
                .on('close', resolve)
                .on('error', reject);
})

module.exports.rimraf = (path, options) => new Promise((resolve, reject) => {
    if(options){
        rimraf(path, options, err => err ? reject(err) : resolve());
    }else{
        rimraf(path, err => err ? reject(err) : resolve());
    }
});

module.exports.spawnDetached = (cmd, args) => {
    const child = spawn(cmd, args || [], {
        stdio: 'ignore',
        detached: true
    });
    child.unref();
    return child;
}