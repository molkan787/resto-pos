// @ts-nocheck
import { Service } from "@/core/Service";
import LocalSetting from "@/prs/localSettings";
import { AppServices } from "..";
import { MurewActions } from "murew-core/dist/enums";
import path from 'path'
import { deleteFile, readFile } from "@/core-helpers";

export const MUREW_SYNC_KEY_LSK = 'murew-sync-key';
const MAX_RETRY_INTERVAL = 5 * 60 * 1000; // 5 minutes
const INITIAL_RETRY_INTERVAL = 1000; // 1 second
const INTENTIONAL_DISCONNECT = 'intentional-disconnect';

export class MurewService extends Service{

    private _status: MurewStatus = MurewStatus.Disconnected;
    private _client: WebSocket;
    private _retryInterval: number = 1000;
    private _syncUrl: string = ''
    public get syncUrl(){
        return this._syncUrl
    }


    public get rawSyncKey(){
        const rawSyncKey = LocalSetting.getItem(MUREW_SYNC_KEY_LSK);
        if(rawSyncKey){
            return rawSyncKey
        }
        return null;
    }

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


    public acceptOrder(orderId: string, readyTime: number){
        this.sendAction(MurewActions.AcceptOrder, {
            id: orderId,
            ready_time: readyTime
        });
    }

    public declineOrder(orderId: string){
        this.sendAction(MurewActions.DeclineOrder, {
            id: orderId
        });
    }

    // ----------------- Internal -----------------

    public async init(){
        await this.loadKeyFromDisk()
        if(this.syncKey){
            this.updateSyncUrlCache()
            this.log('Connecting to murew sync service...');
            this.connect().catch(err => {
                console.error(err);
                this.log('Failed to connected to murew sync service.');
            });
        }else{
            this.log('Murew Sync Key not found.');
        }
    }

    private updateSyncUrlCache(){
        this._syncUrl = this.syncKey.endpoint
        if(this._syncUrl.endsWith('/')){
            this._syncUrl = this._syncUrl.substring(0, this._syncUrl.length - 1)
        }
    }

    private async loadKeyFromDisk(){
        try {
            const electron = imp('electron')
            const userDataDir = electron.app.getPath('userData')
            const keyFilename = path.join(userDataDir, 'murew_sync_key')
            const keyValue = await readFile(keyFilename, { encoding: 'utf8' })
            await deleteFile(keyFilename)
            if(keyValue){
                LocalSetting.setItem(MUREW_SYNC_KEY_LSK, keyValue)
            }
        } catch (error) {
            console.error('loadKeyFromDisk(): An error occured while trying to load sync key')
            console.error(error)
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
            this.updateSyncUrlCache()
            const epURL = new URL(syncKey.endpoint)
            const syncHost = epURL.host;
            const wsProtocol = epURL.protocol === 'https:' ? 'wss' : 'ws'
            if(!syncHost){
                reject('Invalid key');
                return;
            }
            const remoteURL = `${wsProtocol}://${syncHost}/${syncKey.key_id}`
            console.log('murew sync ws url:', remoteURL)
            const client = this._client = new WebSocket(remoteURL, 'murew-protocol');
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
        try {
            const data = JSON.parse(message.data);
            this.log('Received message:', data);
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
            return true;
        }else{
            return false;
        }
    }

    public sendAction(actionName: string, data: any){
        console.log('Sending Action:', actionName)
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
