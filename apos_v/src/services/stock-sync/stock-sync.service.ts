import config from "@/config";
import { Service } from "@/core/Service";
import _url from "@/prs/api";
import store from "@/store";
import Axios from "axios";
import { AppServices } from "..";
import { ServiceEvents } from "../events";

export class StockSyncService extends Service{

    private schduleTimer: any;

    constructor(services: AppServices){
        super(services, StockSyncService.name);
        this.schduleSync();
    }

    private schduleSync() {
        if(this.schduleTimer){
            clearInterval(this.schduleTimer);
        }
        this.schduleTimer = setInterval(() => {
            this.syncStock();
        }, config.syncStockInterval);
    }

    async onOrderPosted(){
        this.schduleSync();
        await this.syncStock();
    }

    async syncStock(){
        this.log('Syncing local stocks');
        const stocks = await this.getStocks();
        const products = store.state.productsByIds;
        for(let i = 0; i < stocks.length; i++){
            const { id, stock } = stocks[i];
            const p = products[id];
            if(p){
                p.stock = stock;
            }
        }
        this.globalEmit(ServiceEvents.STOCK_SYNCED, stocks);
    }

    async getStocks(){
        const { data } = await Axios.get(_url('stocks'));
        return data.stocks;
    }

}