import { Service } from "@/core/Service";
import { AppServices } from "..";
import { RealtimeBackendService } from '../realtime-backend'
import { Commands, TableState } from 'resto-common';
import store from '../../store';
import _url from '../../prs/api';
import axios from 'axios';

export class TableStateService extends Service {

    private rtb: RealtimeBackendService = null;

    constructor(services: AppServices){
        super(services, TableStateService.name);
    }

    public async init(){
        this.rtb = this.services.instances.realtimeBackend;
        this.rtb.on('connect',
            () => setTimeout(
                () => this.loadTablesState()
            , 1000)
        )
        this.rtb.on(Commands.TABLES_STATE_CHANGED, () => this.loadTablesState());
    }

    public setTableState(payload){
        this.rtb.sendCommand(Commands.SET_TABLE_STATE, payload);
    }

    public loadTablesState(): Promise<any>{
        return new Promise(resolve => {
            this.rtb.sendCommand(Commands.REQUEST_TABLES_STATE, null, ({ state }) => {
                this.loadTablesStateIntoSharedStore(state);
                resolve(state);
            })
        })
    }

    public async getBookedTables(date, time){
        const requestUrl = _url(`booking-tables/booked-tables?date=${date}&time=${time}`);
        const { data } = await axios.get(requestUrl);
        return data;
    }

    private loadTablesStateIntoSharedStore(state){
        store.state.tablesState = state;
        // const tablesState = {};
        // Object.values(state).forEach(({ tableNumber, state: s }) => {
        //     tablesState[tableNumber] = (s === TableState.OCCUPIED)
        // });
        // store.state.tablesState = tablesState;
    }

}