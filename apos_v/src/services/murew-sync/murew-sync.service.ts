import { Service } from "@/core/Service";
import { mapPosMenuToMurewTreeMenu } from "@/dataMappers/menu";
import { MurewCategory } from "@/interfaces/murew/MurewCategory";
import store from "@/store";
import { AppServices } from "..";
import { ServiceEvents } from "../events";
import { MurewActions } from "murew-core/dist/enums";
import { MurewService, MurewStatus } from "../murew/murew.service";
import { Offer } from "murew-core/dist/interfaces";

export class MurewSyncService extends Service{

    private get murew(): MurewService{
        return this.services.instances.murew;
    }

    constructor(services: AppServices){
        super(services, MurewSyncService.name);
        this.globalOn(ServiceEvents.STOCK_SYNCED, stocks => this.onStockSynced(stocks));
    }

    async init(){
        this.murew.on(MurewStatus.Connected, () => console.log('Connected to Murew Platform.'));
    }

    public async onDataLoaded(){
        this.log('data loaded');
        // if(this.murew.status == MurewStatus.Connected){
        //     this.sendMenu();
        // }
    }
    
    public async onMenuChanged(){
        // this.sendMenu();
    }

    public onStockSynced(stocks){
        if(!this.murew.isConnected) return;
        this.log('Syncing remote stocks...');
        return this.murew.sendAction(MurewActions.SyncStock, stocks);
    }


    public sendMenu(){
        if(!this.murew.isConnected || !this.services.dataLoaded){
            this.log('Cannot send menu.');
            return;
        }
        this.log('Sending menu...');
        const categories = store.state.allCategories;
        const products = store.state.productsArray;
        const menu = mapPosMenuToMurewTreeMenu(categories, products);
        return this.sendMenuData(menu, store.state.offers);  
    }

    private sendMenuData(menu: MurewCategory[], offers: Offer[]) {
        return this.murew.sendAction(MurewActions.SetMenu, {
            menu,
            offers,
            replace: true
        });
    }

}