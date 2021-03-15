const errors = require('restify-errors');
const Booking = require('../models/Booking');
const { generateReferenceNumber } = require('../utils/common');

module.exports.find = async function (req, res, next){
    try {
        const { date, newer_than, no_client_data } = req.query;
        let query;
        if(date){
            query = Booking.query().where('date', date);
        }else if(newer_than){
            const ts = parseInt(newer_than);
            query = Booking.query().where('updated_at', '>=', ts);
        }else{
            query = Booking.query();
        }
        if(typeof no_client_data == 'undefined'){
            query = query.eager('client');
        }
        const bookings = await query;
        res.send(bookings);
        next();
    } catch (error) {
        console.error(error);
        return next(new errors.InternalError('Error:bk_01'));
    }
}

module.exports.create = async function (req, res, next){
    try {
        const TmpNO = 'TMP' + Math.random().toString().substr(-6);
        const data = req.body;
        data.no = TmpNO
        const booking = await Booking.query().insert(req.body);
        const no = generateReferenceNumber(booking.id, 'PB');
        await Booking.query().update({ no }).where('id', booking.id);
        booking.no = no;
        res.send(booking);
        next();
    } catch (error) {
        console.error(error);
        return next(new errors.InternalError('Error:bk_02'));
    }
}

module.exports.update = async function (req, res, next){
    try {
        const { body, params: { id } } = req;
        const booking = await Booking.query().update(body).where('id', id);
        res.send({ booking });
        next();
    } catch (error) {
        console.error(error);
        return next(new errors.InternalError('Error:bk_03'));
    }
}

module.exports.delete = async function (req, res, next){
    try {
        const { params: { id } } = req;
        await Booking.query().deleteById(id);
        res.send({ id });
        next();
    } catch (error) {
        console.error(error);
        return next(new errors.InternalError('Error:bk_04'));
    }
}

module.exports.sync = async function (req, res, next){
    try {
        const { bookings } = req.body;
        const queries = bookings.map(b => Booking.upsert(b, { no: b.no }));
        await Promise.all(queries);
        res.send({});
        next();
    } catch (error) {
        console.error(error);
        return next(new errors.InternalError('Error:bk_05'));
    }
}