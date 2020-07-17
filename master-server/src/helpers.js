const { exec } = require('child_process');

module.exports.exec = cmd => new Promise((resolve, reject) => {
    exec(cmd, err => err ? reject(err) : resolve());
})

module.exports.areNoneEmptyString = function(){
    const here = module.exports;
    if(!here.isString(...arguments)) return false;
    if(here.stringsLengths(...arguments).min < 1) return false;
    return true;
}

module.exports.isString = function(...args){
    const l = args.length;
    for(let i = 0; i < l; i++){
        if(typeof args[i] != 'string') return false;
    }
    return true;
}

module.exports.stringsLengths = function(...strings){
    const l = strings.length;
    let min = Infinity;
    let max = 0;
    for(let i = 0; i < l; i++){
        const slen = strings[i].length;
        if(slen < min){
            min = slen;
        }
        if(slen > max){
            max = slen;
        }
    }
    return {
        min,
        max,
    }
}

module.exports.isAlphaNumericOnly = function (string){
    return /^[a-z\d\s]+$/i.test(string);
}

module.exports.slugify = function (text){
    if(typeof text != 'string') throw new Error('Argument `text` must be of type string');
    return text
        .trim()
        .replace(/[^a-zA-Z0-9\s]/g, '')
        .toLowerCase()
        .replace(/\s\s+/g, ' ')
        .replace(/\ /g, '-');
}