const {Model} = require('objection');
const time = require('../utils/time');

module.exports = class Booking extends Model{

    static get tableName(){
        return 'bookings';
    }

    static get jsonSchema(){
        return {
            type: 'object',
            required: [],

            properties: {
                id: {type: 'integer'},
                no: {type: 'string'},
                date: {type: 'string'},
                time: {type: 'string'},
                number_of_persons: {type: 'integer'},
                category: {type: 'string'},
                status: {type: 'string'},
                comment: {type: 'string'},
                client_id: {type: 'integer'},
                updated_at: {type: 'integer'},
                created_at: {type: 'integer'},
            }
        };
    };

    static get relationMappings(){
        return {
            client: {
                relation: Model.BelongsToOneRelation,
                modelClass: __dirname + '/Client',
                join: {
                    from: 'bookings.client_id',
                    to: 'clients.id'
                }
            },
        };
    }

    $beforeInsert() {
        if(this.skipTimestamp){
            delete this.skipTimestamp;
            return;
        }
        const ctime =  time.now();
        this.created_at = ctime;
        this.updated_at = ctime;
        delete this.timestamp;
    }

    $beforeUpdate() {
        if(this.skipTimestamp){
            delete this.skipTimestamp;
            return;
        }
        this.updated_at = time.now();
    }

    static async upsert(data, params){
        const existing = await this.query().findOne(params);
        if(existing){
            await this.query().update(data).where('id', existing.id);
        }else{
            await this.query().insert(data);
        }
    }

}