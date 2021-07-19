const {Model} = require('objection');

module.exports = class BookingAssignedTable extends Model{

    static get tableName(){
        return 'booking_assigned_tables';
    }

    static get jsonSchema(){
        return {
            type: 'object',
            required: [],

            properties: {
                booking_no: {type: 'string'},
                table_no: {type: 'integer'},
            }
        };
    };

}