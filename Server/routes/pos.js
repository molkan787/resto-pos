const errors = require('restify-errors');
const time = require('../utils/time');
const Order = require('../models/Order');
const AC = require('../Actions/ActionConsts');
const resMaker = require('../utils/response');

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
        await Order.query().patch(orderData).where({ id: orderId })
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

module.exports = { get, edit };