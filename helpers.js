const { exec, spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const rimraf = require('rimraf');
const { resolve } = require('path');
const ncp = require('ncp').ncp;
const kill = require('tree-kill');


module.exports.sleep = time => new Promise(r => setTimeout(r, time));

module.exports.exec = cmd => new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
        if(error) reject(error);
        else resolve({ stdout, stderr });
    })
});

module.exports.path = function (){
    return path.join(__dirname, ...arguments);
}
module.exports.cp = (src, dest) => new Promise((resolve, reject) => {
    ncp(src, dest, err => err ? reject(err) : resolve());
});

module.exports.rimraf = path => new Promise((resolve, reject) => {
    rimraf(path, err => err ? reject(err) : resolve());
});

const readFile = module.exports.readFile = filename => new Promise((resolve, reject) => {
    fs.readFile(filename, 'utf8', function(err, data) {
        if (err) reject(err);
        else resolve(data);
    });
})

const writeFile = module.exports.writeFile = (filename, data) => new Promise((resolve, reject) => {
    fs.writeFile(filename, data, err => {
        if(err) reject(err);
        else resolve(true);
    })
})

module.exports.replaceInTextFile = async (filename, search, replacement) => {
    let data = await readFile(filename);
    data = data.replace(search, replacement);
    await writeFile(filename, data);
}

module.exports.spawnLiveOutput = ({cwd, cmd, args, printTitle, skipStdErr}, onData, onExit) => {
    const proc = spawn(cmd, args, { cwd });
    proc.stdout.on('data', function (data) {
        if(typeof onData == 'function') onData(data.toString()); 
        fancyPrint(printTitle, data.toString());
    });
    
    if(!skipStdErr){
        proc.stderr.on('data', function (data) {
            fancyPrint(printTitle + '[ERROR]', data.toString());
        });
    }
    
    if(onExit) proc.on('exit', onExit);

    return {
        kill: () => kill(proc.pid),
    }
}

function fancyPrint(title, content){
    const header = '-'.repeat(15) + title + '-'.repeat(15);
    const footer = '-'.repeat(header.length);
    console.log('');
    console.log(header);
    console.log(content);
    console.log(footer);
    console.log('');
}