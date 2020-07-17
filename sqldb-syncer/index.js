const SqlDbSyncer = require('./src');
const { sleep } = require('./src/utils');

async function run(){
    const syncer = new SqlDbSyncer([
        {
            host: '127.0.0.1',
            user: 'root',
            password: '',
            database: 'restopos'
        },
        {
            host: '127.0.0.1',
            user: 'root',
            password: '',
            database: 'restopos_2'
        }
    ], {
        skipTables: ['invoices', 'loyalty_cards', 'prepaid_cards', 'stats', 'transactions', 'user_tokens'],
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

    console.log('Checking for remote changes...')
    const totalUpdates = await syncer.pullChanges();
    console.log('Total updates received:', totalUpdates);

    while(true){
        console.log('Checking for changes...')
        const totalUpdates = await syncer.pushChanges();
        console.log('Total updates sent:', totalUpdates);
        await sleep(30 * 1000);
    }
}

run();