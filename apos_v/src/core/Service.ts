import { AppServices } from "@/services";
import EventEmitter from "eventemitter3";
import { ServiceHooks } from "./ServiceHooks";

export class Service extends EventEmitter implements ServiceHooks{

    constructor(public readonly services: AppServices, public readonly name: string){
        super();
    }

    public async init() {}
    
    protected globalOn(eventName: string, handler: (...args) => void){
        return this.services.on(eventName, handler);
    }

    protected globalEmit(eventName: string, ...args: any[]){
        return this.services.emit(eventName, ...args);
    }

    protected log(...args){
        console.log(`[${new Date().toLocaleString()}][${this.name}]`, ...args);
    }

    public async onDataLoaded(data) {}
    public async onMenuChanged() {}
    public async onOrderPosted(order) {}

}