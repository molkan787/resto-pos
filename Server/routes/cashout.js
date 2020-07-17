const errors = require('restify-errors');
const Action = require('../Actions/Action');
const AC = require('../Actions/ActionConsts');
const resMaker = require('../utils/response');

module.exports = async (req, res, next) => {
    try {
        const _amount = req.body.amount;
        if(typeof _amount != 'number'){
            return next(new errors.BadRequestError('Invalid input type'));
        }
        const amount = Math.floor(parseFloat(_amount) * 100);
        await Action.add(AC.GROUP_ADMIN, AC.TYPE_CASHOUT, 0, amount);
        res.send(resMaker.success({}));
        next();
    } catch (error) {
        return next(new errors.InternalError('ERROR:033'));
    }
};