import { Service } from "@/core/Service";
import EventEmitter from "eventemitter3";
import { AppServices } from "..";
import { MurewActions } from "./constants";

const MAX_RETRY_INTERVAL = 5 * 60 * 1000;
const INITIAL_RETRY_INTERVAL = 1000;

export class MurewService extends Service{

    private _status: MurewStatus = MurewStatus.Disconnected;
    private _client: WebSocket;
    private _retryInterval: number = 1000;

    public get client(){
        return this._client;
    }

    public get status(){
        return this._status;
    }

    constructor(services: AppServices){
        super(services, MurewService.name);
    }


    public acceptOrder(orderId: string){
        this.sendAction(MurewActions.AcceptOrder, {
            id: orderId
        });
    }

    public declineOrder(orderId: string){
        this.sendAction(MurewActions.DeclineOrder, {
            id: orderId
        });
    }

    // ----------------- Internal -----------------

    public async init(){
        this.connect();
    }

    private scheduleReconnect(){
        const delay = this._retryInterval;
        this._retryInterval = Math.min(delay * 2, MAX_RETRY_INTERVAL);
        setTimeout(() => this.connect(), delay);
    }

    private async connect(){
        const client = this._client = new WebSocket('ws://localhost:1337', 'murew-protocol');
        client.onmessage = msg => this.onMessage(msg);
        client.onopen = () => {
            this.log('WebSocket connected!');
            this._status = MurewStatus.Connected;
            this.emit(MurewStatus.Connected);
            this._retryInterval = INITIAL_RETRY_INTERVAL;
        }
        client.onclose = () => {
            this.log('WebSocket disconnected!');
            client.onmessage = null;
            client.onopen = null;
            client.onclose = null;
            this._status = MurewStatus.Disconnected;
            this.emit(MurewStatus.Disconnected);
            this.scheduleReconnect();
        }
    }

    private onMessage(message: MessageEvent){
        this.log('Received message:', message.data);
        try {
            const data = JSON.parse(message.data);
            if(!this.handleAction(data)){
                this.emit('message', message);
            }
        } catch (error) {
            
        }
    }

    /**
     * Returns `true` if the action was handler, if not it returns `false`.
     * @param _data 
     */
    private handleAction(_data): boolean{
        const { action, data } = _data;
        if(Object.values(MurewActions).includes(action)){
            this.emit(action, data);
            console.log(`Action "${action}" handler.`);
            return true;
        }else{
            console.log(`Action "${action}" not handler.`);
            return false;
        }
    }

    public sendAction(actionName: string, data: any){
        const _data = {
            action: actionName,
            data
        };
        this._client.send(JSON.stringify(_data));
    }

}

export enum MurewStatus{
    Connected = 'connected',
    Disconnected = 'disconnected'
}
