const { listTablesAsync } = require('knex-list-db-table');
const MY_TABLES_PREFIX = '__sqlsyncer_';
const METADATA_TABLE = MY_TABLES_PREFIX + 'tables';
const IS_DELETED_COLUMN = '__is_deleted';
const DELETED_TIME_COLUMN = '__deleted_time';
const REF_STATEMENT = "'sql_syncer' = 'sql_syncer'";

module.exports = class MetaData{

    static get IS_DELETED_COLUMN(){ return IS_DELETED_COLUMN; }
    static get DELETED_TIME_COLUMN(){ return DELETED_TIME_COLUMN; }
    static get REF_STATEMENT(){ return REF_STATEMENT; }

    constructor(database, options){
        this.options = options || {};
        this.database = database;
        this.tablesLastIds = {};
        this.tablesLastUpdateTimes = {};
        this.lastUpdateTime = 0;
        this.tables = [];
        this.isNewSetup = false;
        this.database.on('start', (builder) => {
            if(builder._method == 'select' && builder._single && builder._single.table != METADATA_TABLE && !options.skipTables.includes(builder._single.table) && !this.isMyQuery(builder)){
                builder.whereNull(IS_DELETED_COLUMN);
            }
            if(builder._method == 'update')
                console.log(builder.toString());
        })
    }

    isMyQuery(builder){
        const { _statements } = builder;
        for(let statement of _statements){
            const { grouping, type, value } = statement;
            if(grouping == 'where' && type == 'whereRaw'){
                if(value && value.sql == REF_STATEMENT) return true;
            }
        }
        return false;
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
        await this.addDeletedColumns();
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
    
    async addDeletedColumns(){
        for(let table of this.tables){
            const exist = await this.database.schema.hasColumn(table, IS_DELETED_COLUMN);
            if(!exist){
                await this.database.schema.table(table, tb => {
                    tb.integer(IS_DELETED_COLUMN, 2);
                    tb.integer(DELETED_TIME_COLUMN, 11);
                });
            }
        }
    }

}