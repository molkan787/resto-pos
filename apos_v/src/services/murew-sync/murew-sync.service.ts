import { Service } from "@/core/Service";
import { mapPosMenuToMurewTreeMenu } from "@/dataMappers/menu";
import { MurewCategory } from "@/interfaces/murew/MurewCategory";
import store from "@/store";
import { AppServices } from "..";
import { ServiceEvents } from "../events";
import { MurewActions } from "../murew/constants";
import { MurewService, MurewStatus } from "../murew/murew.service";

export class MurewSyncService extends Service{

    private get murew(): MurewService{
        return this.services.instances.murew;
    }

    constructor(services: AppServices){
        super(services, MurewSyncService.name);
        this.globalOn(ServiceEvents.STOCK_SYNCED, stocks => this.onStockSynced(stocks));
    }

    async init(){
        this.murew.on(MurewStatus.Connected, () => this.syncMenu());
    }

    public async onDataLoaded(){
        if(this.murew.status == MurewStatus.Connected){
            this.syncMenu();
        }
    }
    
    public async onMenuChanged(){
        this.syncMenu();
    }

    public onStockSynced(stocks){
        if(!this.murew.isConnected) return;
        this.log('Syncing remote stocks...');
        return this.murew.sendAction(MurewActions.SyncStock, stocks);
    }


    private syncMenu(){
        if(!this.murew.isConnected) return;
        this.log('Syncing menu...');
        const categories = store.state.allCategories;
        const products = store.state.productsArray;
        const menu = mapPosMenuToMurewTreeMenu(categories, products);
        return this.sendMenu(menu);  
    }

    private sendMenu(menu: MurewCategory[]) {
        return this.murew.sendAction(MurewActions.SetMenu, {
            menu
        });
    }

}