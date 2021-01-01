import { Service } from "@/core/Service";
import { MurewActions } from "./constants";

export class MurewService extends Service{

    private _status: MurewStatus = MurewStatus.Disconnected;
    private _client: WebSocket;

    public get client(){
        return this._client;
    }

    public get status(){
        return this._status;
    }

    constructor(){
        super(MurewService.name);
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
        const client = this._client = new WebSocket('ws://localhost:1337', 'murew-protocol');
        client.onmessage = msg => this.onMessage(msg);
        client.onopen = () => {
            this._status = MurewStatus.Connected;
            this.emit(MurewStatus.Connected);
            this.log('WebSocket connected!');
        }
        client.onclose = () => {
            this._status = MurewStatus.Disconnected;
            this.emit(MurewStatus.Disconnected);
            this.log('WebSocket disconnected!');
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
            return true;
        }else{
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
