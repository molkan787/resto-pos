import { io, Socket } from 'socket.io-client';
import EventEmitter from 'eventemitter3';
import { Service } from "@/core/Service";
import { AppServices } from "..";
import _url from '../../prs/api';

export class RealtimeBackendService extends Service {

    private client: Socket = null;
    private eventsBus: EventEmitter = null;

    constructor(services: AppServices){
        super(services, RealtimeBackendService.name);
        this.eventsBus = new EventEmitter();
    }

    public async init(){
        this.client = io(_url(''));
        this.client.on('command', (name, payload) => this.onCommand(name, payload))
    }

    private onCommand(name: string, payload: any){
        this.eventsBus.emit(name, payload);
        console.log('command', name, payload)
    }

    private sendCommand(name: string, payload: any){
        this.client.emit(name, payload);
    }

}