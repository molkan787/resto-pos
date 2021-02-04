const {Model} = require('objection');
const time = require('../utils/time');

module.exports = class Product extends Model{

    static get tableName(){
        return 'products';
    }

    static get jsonSchema(){
        return {
            type: 'object',

            properties: {
                id: {type: 'integer'},
                category_id: {type: 'integer'},
                name: {type: 'string'},
                price: {type: 'integer'},
                stock_enabled: {type: 'integer'},
                stock: {type: 'integer'},
                can_exclude_taxes: {type: 'integer'},
                product_type: {type: 'integer'},
                contains_allergens: {type: 'integer'},
                date_modified: {type: 'integer'}
            }
        }
    }

    static async decrementStock(counts){
        const allIds = Object.entries(counts).map(en => en[0]);
        const products = await this.query().findByIds(allIds).andWhere('stock_enabled', 1);
        const queries = products.map(p => {
            let stock = p.stock - counts[p.id];
            if(stock < 0) stock = 0;
            return this.query().patch({
                stock: stock
            }).where('id', p.id);
        })
        await Promise.all(queries);
    }

    static async put(data){
        const {name, product_type, price, stock_enabled, stock, contains_allergens } = data;
        let p = {
            name,
            price,
            stock_enabled: parseInt(stock_enabled),
            stock: parseInt(stock),
            product_type: parseInt(product_type),
            contains_allergens: parseInt(contains_allergens),
            date_modified: time.now(),
        };
        try {
            if(data.id == 'new'){
                p.category_id = data.category_id;
                p = await this.query().insert(p);
                return p;
            }else{
                await this.query().update(p).where({id: data.id});
                return p;
            }
        } catch (error) {
            throw new Error(error);
        }
    }

}