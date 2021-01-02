const errors = require('restify-errors');
const Product = require('../models/Product');
const resMaker = require('../utils/response');

module.exports = async (req, res, next) => {
    
    try {
        const stocks = await Product.query().select('id', 'stock').where('stock_enabled', 1);
        res.send(resMaker.success({ stocks }));
    } catch (error) {
        return next(new errors.InternalError('ERROR:065'));
    }


}