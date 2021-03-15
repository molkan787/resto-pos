const Config = require('./config');
const SqlDbSyncer = require('./sqldb-syncer');
const { sleep } = require('./sqldb-syncer/utils');

const DEV = global.DEV;

module.exports = class DataSyncer{

    static async init(localDB, remoteDB){
        const syncer = this.syncer = new SqlDbSyncer([
            localDB,
            remoteDB
        ], {
            skipTables: Config.dbSyncSkipTables,
            updatedColumnPerTable: {
                actions: 'date_added',
                categories: 'date_modified',
                products: 'date_modified',
                clients: 'date_added',
                orders: 'date_added',
                users: 'date_added',
            },
        });
        await syncer.init();
    }

    static async start(){;
        while(true){
            try {
                let totalUpdates = await this.syncer.pushChanges();
                console.log('Total updates sent:', totalUpdates);

                await sleep(5 * 1000);
                
                totalUpdates = await this.syncer.pullChanges(); 
                console.log('Total updates received:', totalUpdates)
            } catch (error) {
                console.error(error)
            }

            await sleep(30 * 1000);
        }
    }

}