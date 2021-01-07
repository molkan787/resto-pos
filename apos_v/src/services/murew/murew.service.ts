import { Service } from "@/core/Service";
import LocalSetting from "@/prs/localSettings";
import { AppServices } from "..";
import { MurewActions } from "./constants";

export const MUREW_SYNC_KEY_LSK = 'murew-sync-key';
const MAX_RETRY_INTERVAL = 5 * 60 * 1000; // 5 minutes
const INITIAL_RETRY_INTERVAL = 1000; // 1 second
const INTENTIONAL_DISCONNECT = 'intentional-disconnect';

export class MurewService extends Service{

    private _status: MurewStatus = MurewStatus.Disconnected;
    private _client: WebSocket;
    private _retryInterval: number = 1000;

    private get syncKey(){
        const rawSyncKey = LocalSetting.getItem(MUREW_SYNC_KEY_LSK);
        if(rawSyncKey){
            try {
                const syncKey = JSON.parse(atob(rawSyncKey));
                return syncKey;
            } catch (error) {}
        }
        return null;
    }

    public get client(){
        return this._client;
    }

    public get status(){
        return this._status;
    }

    public get isConnected(){
        return this._status == MurewStatus.Connected;
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
        if(this.syncKey){
            this.log('Connecting to murew sync service...');
            this.connect().catch(err => {
                console.error(err);
                this.log('Failed to connected to murew sync service.');
            });
        }else{
            this.log('Murew Sync Key not found.');
        }
    }

    private scheduleReconnect(){
        const delay = this._retryInterval;
        this._retryInterval = Math.min(delay * 2, MAX_RETRY_INTERVAL);
        setTimeout(() => this.connect().catch(_ => 0), delay);
    }

    public disconnect(){
        if(this._client){
            this._client[INTENTIONAL_DISCONNECT] = true;
            this._client.close();
        }
    }

    public connect(){
        this.disconnect();
        return new Promise((resolve, reject) => {
            const syncKey = this.syncKey;
            if(!syncKey){
                reject('No sync key');
                return;
            }
            const syncHost = new URL(syncKey.endpoint).host;
            if(!syncHost){
                reject('Invalid key');
                return;
            }
            const client = this._client = new WebSocket(`ws://${syncHost}/${syncKey.key_id}`, 'murew-protocol');
            client.onmessage = msg => this.onMessage(msg);
            client.onopen = () => {
                this.log('WebSocket connected!');
                this._status = MurewStatus.Connected;
                this.emit(MurewStatus.Connected);
                this._retryInterval = INITIAL_RETRY_INTERVAL;
                resolve(true);
            }
            client.onclose = (e: CloseEvent) => {
                this.log('WebSocket disconnected!');
                client.onmessage = null;
                client.onopen = null;
                client.onclose = null;
                this._status = MurewStatus.Disconnected;
                this.emit(MurewStatus.Disconnected);
                if(!client[INTENTIONAL_DISCONNECT]){
                    this.scheduleReconnect();
                }
                reject();
            }
        })
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
        if(!this.isConnected) return;
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
