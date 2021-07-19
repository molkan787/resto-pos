const { Service } = require('../../core/Service');
const Booking = require('../../models/Booking');
const Time = require('../../Helpers/Time');

class BookingTablesService extends Service{

    async getBookedTables(date, time){
        const query = Booking.query().eager('assigned_tables').where('date', date);
        Array.isArray(time) ? query.whereIn('time', time) : query.andWhere('time', time);
        const bookings = await query;
        const bookedTables = [].concat(...bookings.map(b => b.assigned_tables)).map(at => at.table_no);
        return bookedTables;
    }

    /**
     * Returns list of currently booked tables within 30 mintes (25 minutes before current time and 5 minutes after)
     * @returns {{ tableNumber: number, booking_no: string, booking_time: string }[]}
     */
    async getCurrentlyBookedTables(){
        const date = new Date();
        date.setMinutes(date.getMinutes() - 25);
        const times = Time.getMinutesInBetween(date, 31);
        const today = Time.dateToStr();
        const bookings = await Booking.query().eager('assigned_tables').where('date', today).whereIn('time', times);
        console.log('bookings', bookings)
        const bookedTables = [];
        for(let i = 0; i < bookings.length; i++){
            const { no, time, assigned_tables} = bookings[i];
            for(let j = 0; j < assigned_tables.length; j++){
                bookedTables.push({
                    booking_no: no,
                    booking_time: time,
                    tableNumber: assigned_tables[j].table_no
                });
            }
        }
        return bookedTables;
    }

}

module.exports = {
    BookingTablesService
};