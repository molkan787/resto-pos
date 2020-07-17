const path = require('path');
const md5 = require('md5');
const { exec } = require('./helpers');
const Security = require('./security');
const CMD_MYSQLDUMP = process.platform == 'win32' ? "C:\\xampp\\mysql\\bin\\mysqldump.exe" : 'mysqldump';
const CMD_MYSQL = process.platform == 'win32' ? "C:\\xampp\\mysql\\bin\\mysql.exe" : 'mysql';
const DB_TEMPLATE_FILENAME = path.join(__dirname, '..', 'ressources', 'vendor_db_template.sql');

module.exports = class VendorsDatabases{

    static async createVendorDB(vendor_id, admin_password){
        const {
            name: db_name,
            user: db_user,
            password: db_password
        } = this.getVendorDBDetails(vendor_id);
        const sql_script = [
            `CREATE DATABASE \`${db_name}\``,
            `CREATE USER '${db_user}'@'%' IDENTIFIED BY '${db_password}'`,
            `GRANT ALL ON \`${db_name}\`.* TO '${db_user}'@'%'`,
            `FLUSH	PRIVILEGES`,
        ].join(';');
        const sql_script2 = [
            `USE \`${db_name}\``,
            `INSERT INTO users VALUES(NULL, 2, 'admin', '${md5(admin_password)}', 'Master', 'Admin', 0, 1, NULL, NULL)`
        ].join(';');

        await this.execSQL(sql_script);
        await this.execSqlFile(DB_TEMPLATE_FILENAME, db_name);
        await this.execSQL(sql_script2);
    }

    static async exportVendorDB(vendor_id){
        const outputFilename = path.join(__dirname, '..', 'files', vendor_id + '.sql');
        const db_name = `vendor_${vendor_id}`;
        await exec(`${CMD_MYSQLDUMP} --compact -u root ${db_name} > ${outputFilename}`);
        return outputFilename;
    }

    static getVendorDBDetails(vendor_id){
        const password = Security.sign(vendor_id);
        const name = `vendor_${vendor_id}`;
        const user = `user_${vendor_id}`;
        return {
            name,
            user,
            password,
        }
    }

    static execSQL(sql){
        return exec(`${CMD_MYSQL} -u root -e "${sql}"`);
    }

    static execSqlFile(filename, database){
        return exec(`${CMD_MYSQL} -u root ${database || ''} < ${filename}`);
    }

}