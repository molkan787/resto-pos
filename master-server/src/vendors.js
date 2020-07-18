const md5 = require('md5');
const db = require('./db');
const Security = require('./security');
const VendorsDBs = require('./vendors_dbs');
const { areNoneEmptyString, isString, stringsLengths, slugify } = require('./helpers');

const TABLE_VENDORS = 'vendors';

module.exports = class Vendors{

    static async getTotalVendorsCount(){
        const result = await db.count('*').from(TABLE_VENDORS);
        return result[0]['count(*)'];
    }

    static getVendors(offset, limit){
        if(typeof offset != 'number' || typeof limit != 'number') throw new Error('Parameters `offset` or `limit` is not a number or was not provided');
        return db.select('*').from(TABLE_VENDORS).orderBy('created_at', 'desc').offset(offset).limit(limit);
    }

    static async authVendorAdmin(vendor_id, password){
        if(!areNoneEmptyString(vendor_id, password)) throw Error('Invalid input arguments');
        const valid = await this._checkVendorAdminPassword(vendor_id, password);
        if(!valid) return false;
        const token = Security.generateToken(vendor_id, 2 * 60);
        return token;
    }

    static async _checkVendorAdminPassword(vendor_id, password){
        if(!await this.vendorIdExists(vendor_id)) return false;
        const { name: db_name } = VendorsDBs.getVendorDBDetails(vendor_id);
        const rows = await db.withSchema(db_name).select('password').from('users').where('username', 'admin').limit(1);
        if(rows.length != 1) throw new Error('Couldn\'t find admin user in vendor\'s databases');
        const { password: hashed_password } = rows[0];
        return md5(password) === hashed_password; 
    }

    static async getVendorById(vendor_id){
        const items = await db.select('*').from(TABLE_VENDORS).where({ vendor_id });
        return items[0] || null;
    }

    static async createVendor(data){
        if(!this.validateVendorData(data)) throw new Error('Invalid input data');
        const { vendor_name, vendor_address, vendor_phone, owner_fullname, admin_password } = data;
        const vendor_id = await this.generateVendorId(vendor_name);
        const fulldata = {
            vendor_id,
            vendor_name,
            vendor_address,
            vendor_phone,
            owner_fullname,
        }
        await db.insert(fulldata).into(TABLE_VENDORS);
        await VendorsDBs.createVendorDB(vendor_id, admin_password);
        return vendor_id;
    }

    static async generateVendorId(vendor_name){
        const date = new Date();
        const slug = slugify(vendor_name);
        for(let i = 0; i < 50; i++){
            const extra = i > 0 ? '-' + (i + 1) : '';
            const _slug = slug + extra;
            if(!await this.vendorIdExists(_slug)){
                return _slug;
            }
        }
        throw new Error('Vendor Id assigning max attemps reached.');
    }

    static async vendorIdExists(vendor_id){
        const rows = await db.select('vendor_id').from(TABLE_VENDORS).where({ vendor_id });
        return rows.length !== 0;
    }

    static validateVendorData(data){
        if(typeof data != 'object')
            throw new Error('`data` must be of type object');

        const { vendor_name, vendor_address, vendor_phone, owner_fullname, admin_password } = data;
        const props = [vendor_name, vendor_address, vendor_phone, owner_fullname, admin_password];

        if(!isString(...props))
            throw new Error('All properties need to be of type string');

        if(stringsLengths(...props).max > 200) return false;
        if(vendor_name.length < 2) return false;
        if(admin_password.length < 6) return false;

        return true;
    }

}