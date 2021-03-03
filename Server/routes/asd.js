const errors = require('restify-errors');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Client = require('../models/Client');
const Settings = require('../models/Settings');
const Order = require('../models/Order');
const Offer = require('../models/Offer');

module.exports = async (req, res, next) => {
    try {
        const categories = await Category.query().orderBy('sort_no', 'DESC');
        const products = await Product.query().orderBy('sort_no', 'DESC');
        const offers = await Offer.query();
        const companies = await Client.query().where({is_company: 1});
        const settings = await Settings.getValues();
        const orderPtr = await Order.getPtr();
        res.send({
            categories,
            products: products,
            offers,
            stats: {},
            companies,
            settings,
            orderPtr,
        });
        next();
    } catch (error) {
        console.error(error)
        return next(new errors.InternalError('Error:002'));
    }
};