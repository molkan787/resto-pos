import { MurewService } from './murew';
import { MurewSyncService } from './murew-sync';

const murewService = new MurewService();

class Services{

    public readonly instances = {
        murew: murewService,
        murewSync: new MurewSyncService(murewService)
    };

    public async init(): Promise<void[]>{
        return Promise.all(Object.values(this.instances).map(instance => instance.init()));
    }

}

export const services = new Services();