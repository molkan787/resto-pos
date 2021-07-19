const errors = require('restify-errors');
const { services: { instances: { bookingTables } } } = require('../services');

module.exports.getBookedTables = async (req, res, next) => {
    try {
        const { date, time } = req.query;
        const bookedTables = await bookingTables.getBookedTables(date, time);
        res.send({
            date,
            time,
            bookedTables
        });
        next();
    } catch (error) {
        console.error(error);
        return next(new errors.InternalError('Error:getBookedTables'));
    }
}