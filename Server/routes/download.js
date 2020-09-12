const fs = require('fs');
const errors = require('restify-errors');
const security = require('../security');
const path = require('path');

module.exports = async (req, res, next) => {
    try {
        const {filename, signature, returnFilename} = req.params;
        if(!filename || !signature){
            return next(new errors.InvalidArgumentError('Invalid Arguments.'));
        }
        if(security.checkSignature(signature, filename)){
            sendFile(filename, res, returnFilename);
            next();
        }else{
            return next(new errors.UnauthorizedError('Invalid Signature'));
        }
    } catch (error) {
        console.log(error)
        return next(new errors.InternalError('ERROR:016'));
    }
};

function sendFile(filename, res, returnFilename){
    const fullpath = path.join(global.TempDir, 'files', filename);
    const readStream = fs.createReadStream(fullpath);
    res.writeHead(200, {
        "Content-Type": 'application/octet-stream',
        "Content-Disposition": "attachment; filename=" + returnFilename,
    });
    readStream.pipe(res);
}