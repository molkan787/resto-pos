const {Model} = require('objection');

module.exports = class BookingSlot extends Model{

    static get tableName(){
        return 'booking_slots';
    }

    static get jsonSchema(){
        return {
            type: 'object',
            required: [],

            properties: {
                day: {type: 'string'},
                time_slots: {type: 'array'},
            }
        };
    };

    static async overwrite(slots){
        await this.query().delete();
        await Promise.all(
            slots.map(s => this.query().insert(s))
        )
    }

}