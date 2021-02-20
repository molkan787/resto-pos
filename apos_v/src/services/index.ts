import { Service } from '@/core/Service';
import { ServiceHooks } from '@/core/ServiceHooks';
import EventEmitter from 'eventemitter3';
import { MurewService } from './murew';
import { MurewSyncService } from './murew-sync';
import { StockSyncService } from './stock-sync';
import { BookingsService } from './bookings';

export class AppServices extends EventEmitter implements ServiceHooks{

    private _dataLoaded: boolean = false;
    public get dataLoaded(): boolean {
        return this._dataLoaded;
    }

    public readonly instances = {
        stockSync: new StockSyncService(this),
        murew: new MurewService(this),
        murewSync: new MurewSyncService(this),
        bookingsService: new BookingsService(this)
    };

    public allServices(): Service[]{
        return Object.values(this.instances);
    }

    public init(): Promise<void[]>{
        return Promise.all(this.allServices().map(instance => instance.init()));
    }

    // ---------- Hooks ----------

    public async onDataLoaded(data){
        this._dataLoaded = true;
        return await Promise.all(this.allServices().map(instance => instance.onDataLoaded(data)));
    }
    
    public async onMenuChanged() {
        return await Promise.all(this.allServices().map(instance => instance.onMenuChanged()));
    }
    
    public async onOrderPosted(order) {
        return await Promise.all(this.allServices().map(instance => instance.onOrderPosted(order)));
    }

}

export const services = new AppServices();