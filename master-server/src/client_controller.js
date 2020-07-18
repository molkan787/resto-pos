const Vendors = require('./vendors');
const VendorsDBs = require('./vendors_dbs');
const Security = require('./security');
const { sleep } = require('./utils');
const fs = require('fs').promises;

module.exports.auth = async function(req, res, next){
    try {
        const { vendor_id, password } = req.body;
        const token = await Vendors.authVendorAdmin(vendor_id, password);
        if(token){
            const database = VendorsDBs.getVendorDBDetails(vendor_id);
            res.json({ token, database });
        }else{
            console.log('No token')
            res.status(401).json({
                error: 'Wrong vendor id or password'
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'Internal error'
        });
    }
    next();
}

module.exports.get_db_dump = async function(req, res, next){
    try {
        const { token } = req.query;
        const vendor_id = Security.getTokenData(token); // throws error if the token is invalid or expired
        const filename = await VendorsDBs.exportVendorDB(vendor_id);
        await sleep(100);
        res.sendFile(filename);
    } catch (error) {
        res.status(500).json({
            error: 'Internal error'
        });
        next();
    }
}

module.exports.get_updates = async (req, res, next) => {
    try {
        const currentAppVersion = await fs.readFile('./current-app-version.txt', 'utf-8');
        res.json({
            currentAppVersion,
        })
    } catch (error) {
        console.error(error)
        res.status(500).send('Internal error');
    }
}