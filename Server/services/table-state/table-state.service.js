const { Service } = require('../../core/Service');
const { Commands, TableState } = require('resto-common');

const KEY_TS_PREF = 'table_state_';

class TableStateService extends Service{

    bookingTables = null;

    constructor(services){
        super(services, TableStateService.name);
    }

    async init(){
        const rc = this.rc = this.services.instances.realtimeCommunication;
        rc.on(Commands.SET_TABLE_STATE, p => this.setTableState(p));
        rc.on(Commands.REQUEST_TABLES_STATE, (p, c, cb) => this.onRequestTablesState(p, c, cb));
        this.bookingTables = this.services.instances.bookingTables;

        // Schedule periodic booked tables state reload
        setInterval(() => this.executeBookedTablesStateReload(), 15 * 1000); // 1 Minute

        this.executeBookedTablesStateReload();
    }

    async executeBookedTablesStateReload(){
        console.log('Reloading booked tables state...');
        try {
            await this.reloadBookedTablesState();
        } catch (error) {
            console.error('/!\\ Failed to reload booked tables state');
            console.error(error);
        }
    }

    async reloadBookedTablesState(){
        const items = await this.ls.valuesWithKeyMatch(KEY_TS_PREF);
        const state = items.reduce((m, i) => (m[i.tableNumber] = i) && m, {});
        // Step 1: Set booked state of booked tables
        const bookedTables = await this.bookingTables.getCurrentlyBookedTables();
        console.log('bookedTables', bookedTables)
        const tasks = [];
        for(let i = 0; i < bookedTables.length; i++){
            const bt = bookedTables[i];
            const { tableNumber } = bt;
            const ts = state[tableNumber] || {};
            const tableStatus = ts.state || TableState.FREE;
            if(tableStatus === TableState.FREE || tableStatus === TableState.BOOKED){
                tasks.push((async () => {
                    const key = `${KEY_TS_PREF}${tableNumber}`;
                    const currentState = await this.ls.getItem(key);
                    this.ls.setItem(key, {
                        ...currentState,
                        ...bt,
                        state: TableState.BOOKED
                    });
                })());
            }
        }
        await Promise.all(tasks);

        // Step 2: Clean booked state of a no more booked tables
        const bookedTablesMap = bookedTables.map(bt => bt.tableNumber).reduce((m, t) => (m[t] = true) && m, {});
        const previouslyBooked = items.filter(t => t.state === TableState.BOOKED && !bookedTablesMap[t.tableNumber]);
        const tasks2 = previouslyBooked.map(ts => (
            this.ls.setItem(`${KEY_TS_PREF}${ts.tableNumber}`, { ...ts, state: TableState.FREE })
        ));
        await Promise.all(tasks2);

        if(tasks.length > 0 || tasks2.length > 0){
            this.rc.emitCommand(Commands.TABLES_STATE_CHANGED, null);
        }
    }

    async setTableState(payload){
        const { tableNumber } = payload;
        await this.ls.setItem(`${KEY_TS_PREF}${tableNumber}`, payload);
        this.rc.emitCommand(Commands.TABLES_STATE_CHANGED, null);
    }

    async getTablesStates(){
        const items = await this.ls.valuesWithKeyMatch(KEY_TS_PREF);
        const state = items.reduce((m, i) => (m[i.tableNumber] = i) && m, {});
        return state;
    }

    // ---------------- Handlers ----------------

    async onRequestTablesState(payload, client, callback){
        const state = await this.getTablesStates();
        callback({
            state
        });
    }

}

module.exports.TableStateService = TableStateService;