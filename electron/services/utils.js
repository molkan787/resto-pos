const fs = require('fs');
const request = require('request');
const rimraf = require('rimraf');
module.exports.sleep = function (time){
    return new Promise(resolve => setTimeout(resolve, time));
}

module.exports.downloadFile = (url, savePath) => new Promise((resolve, reject) => {
    request(url).pipe(fs.createWriteStream(savePath))
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