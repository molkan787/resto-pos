import EventEmitter from "eventemitter3";

export class Service extends EventEmitter{

    constructor(public readonly name: string){
        super();
    }
    
    public async init() {}

    protected log(...args){
        console.log(`[${this.name}][${new Date().toLocaleString()}]`, ...args);
    }

}