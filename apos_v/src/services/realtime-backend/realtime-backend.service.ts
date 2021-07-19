import { io, Socket } from 'socket.io-client';
import { Service } from "@/core/Service";
import { AppServices } from "..";
import _url from '../../prs/api';

export class RealtimeBackendService extends Service {

    private client: Socket = null;

    constructor(services: AppServices){
        super(services, RealtimeBackendService.name);
    }

    public async init(){
        this.client = io(_url(''));
        this.client.on('command', (name, payload) => this.handleCommand(name, payload));
        this.client.on('connect', () => this.emit('connect'));
    }

    private handleCommand(name: string, payload: any){
        this.emit(name, payload);
        console.log('command', name, payload)
    }

    public sendCommand(name: string, payload: any, callback?: (...args) => void){
        this.client.emit('command', name, payload, callback);
    }

}