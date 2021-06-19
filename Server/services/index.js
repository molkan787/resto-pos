const EventEmitter = require('eventemitter3');
const { RealtimeCommunicationService } = require('./realtime-communication')

class AppServices extends EventEmitter{

    _dataLoaded = false;
    get dataLoaded() {
        return this._dataLoaded;
    }

    instances = {
        realtimeCommunication: new RealtimeCommunicationService(this)
    };

    allServices(){
        return Object.values(this.instances);
    }

    init(server){
        return Promise.all(this.allServices().map(instance => instance.init(server)));
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