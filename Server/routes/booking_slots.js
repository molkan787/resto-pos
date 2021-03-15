const errors = require('restify-errors');
const BookingSlot = require('../models/BookingSlot');

module.exports.put = async function (req, res, next){
    try {
        const { booking_slots } = req.body;
        await BookingSlot.overwrite(booking_slots);
        res.send({});
        next();
    } catch (error) {
        console.error(error);
        return next(new errors.InternalError('Error:bks_01'));
    }
}