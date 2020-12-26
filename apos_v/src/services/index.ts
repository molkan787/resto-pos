import { MurewService } from './murew';
class Services{

    public readonly instances = {
        murew: new MurewService(),
    };

    public async init(): Promise<void[]>{
        return Promise.all(Object.values(this.instances).map(instance => instance.init()));
    }

}

export const services = new Services();