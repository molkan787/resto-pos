const MetaData = require('./metadata');
module.exports = class Changes {

    constructor(databases, options){
        const {
            updatedColumn, idColumn, maxRowsCount,
            updatedColumnPerTable, idColumnPerTable,
            skipTables
        } = options;

        this.updatedColumn = updatedColumn;
        this.idColumn = idColumn;
        this.updatedColumnPerTable = updatedColumnPerTable;
        this.idColumnPerTable = idColumnPerTable;
        this.maxRowsCount = maxRowsCount;
        this.skipTables = skipTables;

        const [db1, db2] = databases;
        this.db1 = db1;
        this.db2 = db2;

        this.metadata1 = new MetaData(db1);
        this.metadata2 = new MetaData(db2);
    }

    async init(){
        await this.metadata1.init();
        await this.metadata2.init();
        if(this.metadata1.isNewSetup){
            await this.setCurrentStamps(this.db1, this.metadata1);
        }
    }

    async getChanges(dbNum){
        let secondRanNeeded = false;
        const changes = [];
        const db = dbNum == 1 ? this.db1 : this.db2;
        const metadata = dbNum == 1 ? this.metadata2 : this.metadata1;
        const metadata_cdb = dbNum !== 1 ? this.metadata2 : this.metadata1;
        for(let table of metadata.tables){
            if(this.skipTables.includes(table)) continue;
            const { newRows, updatedRows } = await this.getTableChanges(db, metadata, table);
            if(newRows.length || updatedRows.length){
                changes.push({
                    table,
                    newRows,
                    updatedRows
                })
                if(newRows.length == this.maxRowsCount || updatedRows.length == this.maxRowsCount){
                    secondRanNeeded = true;
                }

                const updatedColumn = this._getTableUpdatedColumn(table);
                if(updatedRows.length){
                    const latestTime = this._getHighestValue(updatedRows, updatedColumn);
                    await metadata_cdb.setLastUpdateTime(table, latestTime);
                }
                if(newRows.length){
                    const idColumn = this._getTableIdColumn(table);
                    const highestId = this._getHighestValue(newRows, idColumn);
                    await metadata_cdb.setLastId(table, highestId);
                    const latestTime = this._getHighestValue(newRows, updatedColumn);
                    await metadata_cdb.setLastUpdateTime(table, latestTime);
                }
                
            }
        }
        return {
            changes,
            secondRanNeeded,
        };
    }

    _getHighestValue(rows, column){
        const values = rows.map(row => parseInt(row[column]));
        return Math.max(...values);
    }

    async getTableChanges(db, metadata, table){
        const lastId = metadata.getLastId(table);
        const idColumn = this._getTableIdColumn(table);
        const newRows = await db.select().from(table)
                        .where(idColumn, '>', lastId).orderBy(idColumn, 'asc').limit(this.maxRowsCount);
        const updatedRows = await db.select().from(table)
                        .where(this._getTableUpdatedColumn(table), '>', metadata.getLastUpdateTime(table))
                        .andWhere(idColumn, '<=', lastId)
                        .limit(this.maxRowsCount);
        return {
            newRows,
            updatedRows,
        }
    }

    async setCurrentStamps(db, metadata){
        for(let table of metadata.tables){
            if(this.skipTables.includes(table)) continue;
            const idColumn = this._getTableIdColumn(table);
            const updatedColumn = this._getTableUpdatedColumn(table);
            const lastIdRow = await db.select(idColumn).from(table).orderBy(idColumn, 'desc').limit(1);
            const lastUpdateRow = await db.select(updatedColumn).from(table).orderBy(updatedColumn, 'desc').limit(1);
            const lastId = lastIdRow.length ? lastIdRow[0][idColumn] : 0;
            const lastUpdateTime = lastUpdateRow.length ? lastUpdateRow[0][updatedColumn] : 0;
            await metadata.setStamps(table,lastId, lastUpdateTime);
        }
    }

    _getTableIdColumn(tableName){
        return this.idColumnPerTable[tableName] || this.idColumn;
    }
    
    _getTableUpdatedColumn(tableName){
        return this.updatedColumnPerTable[tableName] || this.updatedColumn;
    }
}