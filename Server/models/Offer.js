const { Model } = require('objection');

module.exports = class Offer extends Model{

    static get tableName(){
        return 'offers';
    }

    static get jsonSchema(){
        return {
            type: 'object',

            properties: {
                id: {type: 'integer'},
                name: {type: 'string'},
                expires: {type: 'date'},
                condition: {
                    type: 'object',
                    properties: {
                        minimum_order_value: { type: 'float' },
                        minimum_items_count: { type: 'integer' },
                    }
                },
                available_on_delivery: {type: 'integer'},
                available_on_pickup: {type: 'integer'},
                available_on_website: {type: 'integer'},
                available_on_pos: {type: 'integer'},
                benefits: {type: 'object'},
                activated_by_promo_code: {type: 'integer'},
                promo_code: {type: 'string'},
            }
        }
    }

}