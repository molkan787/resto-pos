const EventEmitter = require('eventemitter3');

module.exports.Service = class Service extends EventEmitter{

    constructor(services, name){
        super();
        this.services = services;
        this.name = name;
    }

    async init(server) {}
    
    globalOn(eventName, handler){
        return this.services.on(eventName, handler);
    }

    globalEmit(eventName, ...args){
        return this.services.emit(eventName, ...args);
    }

    log(...args){
        console.log(`[${new Date().toLocaleString()}][${this.name}]`, ...args);
    }

    get ls(){
        return this.services.ls;
    }

    async onDataLoaded(data) {}
    async onMenuChanged() {}
    async onOrderPosted(order) {}

}