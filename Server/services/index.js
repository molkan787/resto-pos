const EventEmitter = require('eventemitter3');
const { RealtimeCommunicationService } = require('./realtime-communication')
const { TableStateService } = require('./table-state')
const { BookingTablesService } = require('./booking-tables');
const storage = require('node-persist');
const path = require('path');
const { remote } = require('electron');

class AppServices extends EventEmitter{

    _dataLoaded = false;
    get dataLoaded() {
        return this._dataLoaded;
    }

    localStorage = null;

    instances = {
        realtimeCommunication: new RealtimeCommunicationService(this),
        tableState: new TableStateService(this),
        bookingTables: new BookingTablesService(this)
    };

    allServices(){
        return Object.values(this.instances);
    }

    get ls(){
        return this.localStorage;
    }

    async init(server){
        const appDataDir = remote ? path.join(remote.app.getPath('appData'), remote.app.getName()) : '.';
        const lsFilename = path.join(appDataDir, 'lsdata');
        console.log('lsFilename', lsFilename)
        await storage.init({
            dir: lsFilename,
            expiredInterval: 30 * 60 * 1000
        })
        this.localStorage = storage;
        return await Promise.all(this.allServices().map(instance => instance.init(server)));
    }

    // ---------- Hooks ----------

    async onDataLoaded(data){
        this._dataLoaded = true;
        return await Promise.all(this.allServices().map(instance => instance.onDataLoaded(data)));
    }
    
    async onMenuChanged() {
        return await Promise.all(this.allServices().map(instance => instance.onMenuChanged()));
    }
    
    async onOrderPosted(order) {
        return await Promise.all(this.allServices().map(instance => instance.onOrderPosted(order)));
    }

}

module.exports.services = new AppServices();