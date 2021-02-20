import { Service } from "@/core/Service";
import store from "@/store";
import Utils from "@/utils";
import { MurewActions } from "murew-core/dist/enums";
import { AppServices } from "..";
import { MurewService, MurewStatus } from "../murew";

const FETCH_INTERVAL = 1000 * 60 * 10;

export class BookingsService extends Service{

    constructor(services: AppServices){
        super(services, BookingsService.name);
    }

    private fetchTimer?: number;

    private get murew(): MurewService{
        return this.services.instances.murew;
    }

    async init(){
        this.murew.on(MurewStatus.Connected, () => this.start());
        this.murew.on(MurewStatus.Disconnected, () => this.unScheduleFetchs());
        this.murew.on(MurewActions.SendBookingsList, data => this.onBookingsListReceived(data));
        store.watch(
            state => state.bookings.filterDate,
            () => this.requestBookings()
        )
    }

    start(){
        this.scheduleFetchs();
        this.requestBookings();
    }

    unScheduleFetchs(){
        if(this.fetchTimer){
            clearInterval(this.fetchTimer);
        }
    }

    scheduleFetchs(){
        this.unScheduleFetchs();
        this.fetchTimer = <any>setInterval(() => this.requestBookings(), FETCH_INTERVAL);
    }

    requestBookings(){
        store.state.bookings.loading = true;
        setTimeout(() => store.state.bookings.loading = false, 10000);
        const { filterDate } = store.state.bookings;
        const today = Utils.todaysDate('-');
        const dates = [today];
        if(filterDate && filterDate != today){
            dates.push(filterDate);
        }
        this.murew.sendAction(MurewActions.RequestBookingsList, {
            dates: dates
        }),
        this.log('Requested bookings list');
    }

    onBookingsListReceived(data: any[]){
        const today = Utils.todaysDate('-');
        const todays = data.filter(b => b.date == today);
        const other = data.filter(b => b.date != today);
        const { bookings } = store.state;
        bookings.todays = todays;
        bookings.other = other;
        bookings.loading = false;
        console.log(data)
    }

}