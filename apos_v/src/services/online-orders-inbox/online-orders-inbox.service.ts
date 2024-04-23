import Vue from "*.vue";
import { Service } from "@/core/Service";
import { MurewActions } from "murew-core/dist/enums";
import { AppServices } from "..";
import { MurewStatus } from "../murew";

export class OnlineOrdersInboxService extends Service{

    constructor(services: AppServices){
        super(services, OnlineOrdersInboxService.name);
    }

    public async init(){
        this.services.instances.murew.on(MurewActions.NewOrder, order => this.onNewOrder(order));
        // this.services.instances.murew.on(MurewStatus.Connected, () => this.requestOnGoingOrders());
    }

    private uiModal: Vue;
    private ordersQueue: any[] = [];

    requestOnGoingOrders(){
        this.services.instances.murew.sendAction(MurewActions.RequestOnGoingOrdersList, {})
    }

    onNewOrder(order: any){
        this.queueOrder(order);
        this.showNextOrder();
    }

    queueOrder(order: any){
        const index = this.ordersQueue.findIndex(o => o.id === order.id);
        if(index == -1){
            this.ordersQueue.push(order);
        }
    }

    removeFromQueue(order){
        const index = this.ordersQueue.findIndex(o => o.id === order.id);
        this.ordersQueue.splice(index, 1)
    }

    showNextOrder(){
        if(this.isUiModalOpen()) return;
        const order = this.ordersQueue[0];
        if(order){
            (<any>this.uiModal).handleNewOrder(order);
        }
    }

    private isUiModalOpen(){
        return this.uiModal.$data.isOpen;
    }

    public setUiModal(el: Vue){
        this.uiModal = el;
        el.$on('closed', () => {
            this.removeFromQueue(this.uiModal.$data.order)
            setTimeout(() => this.showNextOrder(), 500);
        });
    }

}