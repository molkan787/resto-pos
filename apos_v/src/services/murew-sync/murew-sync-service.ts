import { Service } from "@/core/Service";
import { MurewService } from "../murew/murew-service";

export class MurewSyncService extends Service{

    constructor(readonly murewService: MurewService){
        super(MurewSyncService.name);
    }

    private get client(){
        return this.murewService.client;
    }

}