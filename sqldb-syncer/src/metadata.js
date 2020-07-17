const { listTablesAsync } = require('knex-list-db-table');
const MY_TABLES_PREFIX = '__sqlsyncer_';
const METADATA_TABLE = MY_TABLES_PREFIX + 'tables';
const IS_DELETED_COLUMN = '__is_deleted';

module.exports = class MetaData{

    constructor(database, options){
        this.options = options || {};
        this.database = database;
        this.tablesLastIds = {};
        this.tablesLastUpdateTimes = {};
        this.lastUpdateTime = 0;
        this.tables = [];
        this.isNewSetup = false;
        // this.database.on('start', function(builder) {
        //     // if(builder._method == 'select'){
        //     //     builder.andWhere(IS_DELETED_COLUMN, '!=', 1);
        //     // }
        //     // console.log(builder.toString())
        //     // console.log(builder._single)
        // })
    }

    getLastUpdateTime(tableName){
        return this.tablesLastUpdateTimes[tableName] || 0;
    }

    getLastId(tableName){
        return this.tablesLastIds[tableName] || 0;
    }

    async setStamps(tableName, lastId, lastUpdateTime){
        const _lastId = parseInt(lastId);
        const _lastUpdateTime = parseInt(lastUpdateTime);
        await this._saveTableMetaData(tableName, _lastId, _lastUpdateTime);
        this.tablesLastIds[tableName] = _lastId;
        this.tablesLastUpdateTimes[tableName] = _lastUpdateTime;
    }

    async setLastId(tableName, lastId){
        const _lastId = parseInt(lastId);
        await this._saveTableMetaData(tableName, _lastId, this.getLastUpdateTime(tableName));
        this.tablesLastIds[tableName] = _lastId;
    }

    
    async setLastUpdateTime(tableName, lastUpdateTime){
        const _lastUpdateTime = parseInt(lastUpdateTime);
        if(_lastUpdateTime <= this.tablesLastUpdateTimes[tableName]) return;
        await this._saveTableMetaData(tableName, this.getLastId(tableName), _lastUpdateTime);
        this.tablesLastUpdateTimes[tableName] = _lastUpdateTime;
    }

    async _saveTableMetaData(tableName, lastId, lastUpdateTime){
        await this.database.del().from(METADATA_TABLE).where('name', tableName);
        await this.database.insert({
            name: tableName, 
            last_id: lastId,
            last_update_time: lastUpdateTime
        }).into(METADATA_TABLE);
    }

    async init(){
        const firstInit = !await this.database.schema.hasTable(METADATA_TABLE);
        if(firstInit){
            this.isNewSetup = true;
            await this.createTables();
        }
        await this.load();
        await this.addDeletedColumn();
    }


    async load(){
        const tables = await listTablesAsync(this.database);
        this.tables = tables.filter(t => t !== METADATA_TABLE);
        await this.loadValues();
    }

    async loadValues(){
        const rows = await this.database.select().from(METADATA_TABLE);
        for(let row of rows){
            const { name, last_id, last_update_time } = row;
            this.tablesLastIds[name] = parseInt(last_id);
            this.tablesLastUpdateTimes[name] = parseInt(last_update_time);
        }
        console.log('MetaData: Values loaded!')
    }

    async createTables(){
        await this.database.schema.createTable(METADATA_TABLE, table => {
            table.string('name', 255);
            table.integer('last_id');
            table.integer('last_update_time');
        })
        await this.database.schema.alterTable(METADATA_TABLE, table => {
            table.unique('name');
        })
    }
    
    async addDeletedColumn(){
        for(let table of this.tables){
            const exist = await this.database.schema.hasColumn(table, IS_DELETED_COLUMN);
            if(!exist){
                await this.database.schema.table(table, tb => {
                    tb.integer(IS_DELETED_COLUMN, 2);
                });
            }
        }
    }

}