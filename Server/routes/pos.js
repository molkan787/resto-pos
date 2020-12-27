const errors = require('restify-errors');
const time = require('../utils/time');
const Order = require('../models/Order');
const AC = require('../Actions/ActionConsts');
const resMaker = require('../utils/response');
const Product = require('../models/Product');

const get = async (req, res, next) => {
    try {
        const orderId = req.params.id;
        const order = await Order.query().findById(orderId);
        if(order){
            res.send(resMaker.success({ order }));
            next();
        }else{
            return next(new errors.NotFoundError('Order not found'));
        }
    } catch (error) {
        return next(new errors.InternalError('ERROR:034'));
    }
};

const edit = async (req, res, next) => {
    try {
        const orderId = req.params.id;
        const { orderData } = req.body;
        await Order.adjustClientId(orderData);
        orderData.date_added = time.now();
        const oldOrderData = await Order.query().findById(orderId);
        await Order.query().patch(orderData).where({ id: orderId })
        const counts = getProductsCountDiffrences(oldOrderData.items.counts, orderData.items.counts);
        console.log('counts diff', counts);
        await Product.decrementStock(counts);
        res.send({
            status: 'OK',
            balances: {},
            orderId: parseInt(orderId),
            date_added: orderData.date_added,
            loyaltyPoints: 0,
            // loyaltyPoints: points,
        });
        next();
    } catch (error) {
        console.error(error);
        return next(new errors.InternalError('ERROR:035'));
    }
}

const getProductsCountDiffrences = (oldCounts, newCounts) => {
    const oldEntries = Object.entries(oldCounts);
    const newEntries = Object.entries(newCounts);
    const all = [].concat(oldEntries, newEntries).reduce((m, en) => (m[en[0]] = 1) && m, {});
    const allEntries = Object.entries(all);
    for(let [id] of allEntries){
        const oldQty = oldCounts[id] || 0;
        const newQty = newCounts[id] || 0;
        all[id] = newQty - oldQty;
        if(all[id] == 0){
            delete all[id];
        }
    }
    return all;
}

module.exports = { get, edit };