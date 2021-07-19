const errors = require('restify-errors');
const Booking = require('../models/Booking');
const BookingAssignedTable = require('../models/BookingAssignedTable');
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
        query.eager('assigned_tables');
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
        const { body, params: { id }, query: { byNo } } = req;
        const searchProp = typeof byNo === 'undefined' ? 'id' : 'no';
        const booking = await Booking.query().update(body).eager('assigned_tables').where(searchProp, id);
        if(body.no && body.assigned_tables){
            await BookingAssignedTable.query().delete().where('booking_no', body.no);
            await Promise.all(body.assigned_tables.map(at =>  BookingAssignedTable.query().insert(at)))
        }
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