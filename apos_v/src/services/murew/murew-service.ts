import { Service } from "@/core/Service";

export class MurewService extends Service{

    private _status: MurewStatus = MurewStatus.Disconnected;
    private client: WebSocket;

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
        const client = this.client = new WebSocket('ws://localhost:1337', 'echo-protocol');
        client.onmessage = msg => this.onMessage(msg);
        client.onopen = () => {
            this._status = MurewStatus.Connected;
            this.log('WebSocket connected!');
        }
        client.onclose = () => {
            this._status = MurewStatus.Disconnected;
            this.log('WebSocket disconnected!');
        }
    }

    private onMessage(message: MessageEvent){
        this.log('Received message:', message.data);
        try {
            const data = JSON.parse(message.data);
            this.handleAction(data);
        } catch (error) {
            
        }
    }

    private handleAction(_data){
        const { action, data } = _data;
        if(Object.values(MurewActions).includes(action)){
            this.emit(action, data);
        }
    }

    private sendAction(actionName: string, data: any){
        const _data = {
            action: actionName,
            data
        };
        this.client.send(JSON.stringify(_data));
    }

}

export enum MurewStatus{
    Connected = 'connected',
    Disconnected = 'disconnected'
}

export enum MurewActions{
    NewOrder = 'new-order',
    OrderStatusChanged = 'order-status-changed',
    AcceptOrder = 'accept-order',
    DeclineOrder = 'decline-order'
}