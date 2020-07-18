const Vendors = require('./vendors');
const Security = require('./security');

module.exports.get_vendors = async (req, res, next) => {
    try {
        const { offset, limit } = req.query;
        if(isNaN(offset) || isNaN(limit)){
            res.status(400).send('Missing or invalid parameters');
        }else{
            const _offset = parseInt(offset);
            const _limit = parseInt(limit);
            const vendors = await Vendors.getVendors(_offset, _limit);
            const total = await Vendors.getTotalVendorsCount();
            res.json({
                items: vendors,
                total,
            })
        }
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal error');
    }
    next();
}

module.exports.edit_vendor = async (req, res, next) => {
    try {
        const data = req.body;
        const vendor_id = await Vendors.createVendor(data);
        const vendor = await Vendors.getVendorById(vendor_id);
        res.json({ vendor });
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal error');
    }
    next();
}

module.exports.auth = async (req, res, next) => {
    const { username, password } = req.body;
    if(username == 'admin' && password == '123456'){
        const token = Security.generateToken('@admin', 24 * 60 * 60);
        res.json({ token });
    }else{
        res.status(401).send('Invalid credentials');
    }
    next();
}

module.exports.check = (req, res, next) => {
    res.send('ok');
    next();
}