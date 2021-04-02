import Vue from "*.vue";
import { Service } from "@/core/Service";
import { MurewActions } from "murew-core/dist/enums";
import { AppServices } from "..";

export class OnlineOrdersInboxService extends Service{

    constructor(services: AppServices){
        super(services, OnlineOrdersInboxService.name);
    }

    public async init(){
        this.services.instances.murew.on(MurewActions.NewOrder, order => this.onNewOrder(order));
    }

    private uiModal: Vue;
    private ordersQueue: any[] = [];

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

    showNextOrder(){
        if(this.isUiModalOpen()) return;
        const order = this.ordersQueue.shift();
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
            setTimeout(() => this.showNextOrder(), 500);
        });
    }

}