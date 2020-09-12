const errors = require('restify-errors');
const Action = require('../Actions/Action');
const AC = require('../Actions/ActionConsts');
const resMaker = require('../utils/response');
const Order = require('../models/Order');
const WhereBuilder = require('../utils/whereBuilder');
const time = require('../utils/time');

module.exports = async (req, res, next) => {
    try {
        const _amount = req.body.amount;
        const day = req.body.day;
        if(typeof _amount != 'number'){
            return next(new errors.BadRequestError('Invalid input type'));
        }
        const amount = Math.floor(parseFloat(_amount) * 100);
        await Action.add(AC.GROUP_ADMIN, AC.TYPE_CASHOUT, 0, amount);
        await freakOut(day, amount);
        res.send(resMaker.success({}));
        next();
    } catch (error) {
        return next(new errors.InternalError('ERROR:033'));
    }
};

async function freakOut(day, amount){
    const cond = WhereBuilder.dateRange({date_from: day, date_to: day}, null, 'status = 1');
    const orders = await Order.query().select('id', 'total').where('pay_method', 'cash').andWhereRaw(cond);
    const total = orders.reduce((current, order) => current + order.total, 0);
    const ratio = amount / total;
    const tasks = [];
    for(let order of orders){
        const { total, id } = order;
        const not = Math.floor(total - (total * ratio));
        tasks.push(
            Order.query().patch({
                total: not,
                date_added: time.now()
            }).where('id', id)
        );
    }
    await Promise.all(tasks);
}