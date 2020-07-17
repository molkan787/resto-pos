require('./my_polyfill');
const Databases = require('./databases');
const Changes = require('./changes');
const MetaData = require('./metadata');
class SqlDbSyncer{

    constructor(configs, options){
        const _options = this._getOption(options);
        const databases = Databases.createConnections(configs[0], configs[1]);
        this.db1 = databases[0];
        this.db2 = databases[1];
        this.changesAgent = new Changes(databases, _options);
    }

    async init(){
        await this.changesAgent.init();
    }

    pushChanges(){
        return this.transferChanges(1);
    }

    pullChanges(){
        return this.transferChanges(2);
    }

    async transferChanges(masterDbNum){
        const db = masterDbNum == 1 ? this.db2 : this.db1;
        const metadata = this.changesAgent[masterDbNum == 1 ? 'metadata2' : 'metadata1'];

        const { changes, secondRanNeeded } = await this.changesAgent.getChanges(masterDbNum);
        const totalUpdates = await this._sendChanges(db, metadata, changes);
        if(changes.length){
            console.log(changes)
        }

        if(secondRanNeeded){
            return (await this.transferChanges(masterDbNum)) + totalUpdates;
        }
        return totalUpdates;
    }

    async _sendChanges(db, metadata, items){
        let totalUpdates = 0;
        for(let item of items){
            const { table, updatedRows, newRows } = item;
            const idColumn = this.changesAgent._getTableIdColumn(table);
            const updatedColumn = this.changesAgent._getTableUpdatedColumn(table);
            totalUpdates += updatedRows.length + newRows.length;

            let lastestTime = 0;
            if(updatedRows.length){
                await db.transaction(trx => {
                    const promises = updatedRows.map(row => {
                        const id = row[idColumn];
                        const rowUpdatedTime = row[updatedColumn];
                        const rowDeletedTime = row[MetaData.DELETED_TIME_COLUMN] || 0;
                        lastestTime = Math.max(lastestTime, rowUpdatedTime, rowDeletedTime);
                        return db(table).transacting(trx).update(row).where(idColumn, id);
                    });
                    console.log(promises[0].toString())
                    Promise.all(promises).then(async () => {
                        await metadata.setLastUpdateTime(table, lastestTime);
                        trx.commit();
                    }).catch(err => {
                        trx.rollback();
                        console.error(err);
                    })
                    return trx;
                });
            }
            if(newRows.length){
                let highestId = 0;
                await db.transaction(trx => {
                    newRows.forEach(row => {
                        const id = row[idColumn];
                        const rowUpdatedTime = row[updatedColumn];
                        delete row[idColumn];
                        highestId = Math.max(highestId, id);
                        lastestTime = Math.max(lastestTime, rowUpdatedTime);
                    });
                    return trx.insert(newRows).into(table);
                });
                await metadata.setLastId(table, highestId);
                await metadata.setLastUpdateTime(table, lastestTime);
            }
        }
        return totalUpdates;
    }

    _getOption(userOptions){
        const options = Object.clone(defaultOptions);
        return Object.patch(options, userOptions || {});
    }

}

const defaultOptions = {
    skipTables: [],
    updatedColumn: 'date_modified',
    idColumn: 'id',
    updatedColumnPerTable: {},
    idColumnPerTable: {},
    maxRowsCount: 10,
}

module.exports = SqlDbSyncer;