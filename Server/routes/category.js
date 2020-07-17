const errors = require('restify-errors');
const Category = require('../models/Category');
const resMaker = require('../utils/response');
const time = require('../utils/time');

module.exports.edit = async (req, res, next) => {
    try {
        const cdata = req.body;
        const id = cdata.id;
        cdata.icon = '';
        cdata.date_modified = time.now();
        delete cdata.id;
        let data = null;
        if(id == 'new'){
            data = await Category.query().insert(cdata);
        }else{
            data = await Category.query().patch(cdata).where({ id });
        }
        res.send(resMaker.success({data}));
    } catch (error) {
        console.log(error);
        return next(new errors.InternalError('ERROR:030'));
    }
}

module.exports.delete = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        await Category.query().deleteById(id);
        res.send(resMaker.success());
    } catch (error) {
        console.log(error);
        return next(new errors.InternalError('ERROR:031'));
    }
};