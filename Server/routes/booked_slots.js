const Booking = require('../models/Booking');

module.exports.get = async (req, res, next) => {
    const { month } = req.query;
    const bookings = await Booking.query().where('date', 'like', `${month}-%`).andWhere('status', 'booked');
    // res.send(bookings);
    res.send(reduceBookedSlots(bookings));
    next();
}

function reduceBookedSlots(bookings){
    const m = {};
    const len = bookings.length;
    for(let i = 0; i < len; i++){
        const { date, time, number_of_persons } = bookings[i];
        const d = m[date] || (m[date] = {});
        const t = d[time] || (d[time] = []);
        t.push(number_of_persons);
    }
    return m;
}