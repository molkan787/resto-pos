import { sleep } from "@/core-helpers";
import { Service } from "@/core/Service";
import { mapMurewBookingToPosBooking, mapPosBookingToMurewBooking } from "@/dataMappers/bookings";
import Dl from "@/prs/dl";
import DM from "@/prs/dm";
import { mapBookingSlotsObjectToArray } from "@/prs/helpers";
import time from "@/prs/time";
import store from "@/store";
import { MurewActions } from "murew-core/dist/enums";
import { AppServices } from "..";
import { MurewService, MurewStatus } from "../murew";

const LSKEY_BOOKING_LUTS_SENT = 'bookigns_luts_sent';
const LSKEY_BOOKING_LUTS_RECEIVED = 'bookigns_luts_received';

export class BookingsService extends Service{

    constructor(services: AppServices){
        super(services, BookingsService.name);
    }

    private get murew(): MurewService{
        return this.services.instances.murew;
    }

    async init(){
        this.murew.on(MurewStatus.Connected, () => this.sync());
        this.murew.on(MurewActions.SendBookingsList, (data) => this.onBookingsReceived(data));
        this.murew.on(MurewActions.BookingsReceivedConfirmation, (data) => this.onBookingsRecivedConfirmation(data));
        this.murew.on(MurewActions.StartBookingsSyncingProcess, () => this.syncBookings());
    }

    async sync(){
        this.syncBookingSlots();
        await sleep(2000);
        await this.syncBookings();
    }

    syncBookingSlots(){
        const booking_slots = mapBookingSlotsObjectToArray(store.state.bookingSlots);
        this.murew.sendAction(MurewActions.SetBookingSlots, {
            booking_slots
        });
    }

    async syncBookings(){
        this.murew.sendAction(MurewActions.RequestBookingsList, {
            timestamp: this.getLastReceiveTimestamp()
        });
    }

    async onBookingsReceived(data){
        const { bookings, timestamp } = data;
        const _bookings = bookings.map(b => {
            const _b: any = mapMurewBookingToPosBooking(b);
            _b.skipTimestamp = true;
            return _b;
        });
        await DM.syncBookings(_bookings);
        this.setLastReceiveTimestamp(timestamp);
        this.sendBookings();
    }

    async sendBookings(){
        const lsts = this.getLastSendTimestamp();
        const now = time.now();
        const bookings = await Dl.getBookings({
            newer_than: lsts,
            no_client_data: true
        });
        const _bookings = bookings.map(b => mapPosBookingToMurewBooking(b));
        this.murew.sendAction(MurewActions.SendBookingsList, {
            bookings: _bookings,
            timestamp: now
        })
    }

    onBookingsRecivedConfirmation(data){
        const { timestamp } = data;
        this.setLastSendTimestamp(timestamp);
    }

    getLastReceiveTimestamp(){
        const ts = window.localStorage.getItem(LSKEY_BOOKING_LUTS_RECEIVED);
        return parseInt(ts || '0');
    }

    getLastSendTimestamp(){
        const ts = window.localStorage.getItem(LSKEY_BOOKING_LUTS_SENT);
        return parseInt(ts || '0');
    }
    
    setLastReceiveTimestamp(timestamp: number){
        const ts = this.getLastReceiveTimestamp();
        if(timestamp > ts){
            window.localStorage.setItem(LSKEY_BOOKING_LUTS_RECEIVED, timestamp.toString());
        }
    }

    setLastSendTimestamp(timestamp){
        const ts = this.getLastSendTimestamp();
        if(timestamp > ts){
            window.localStorage.setItem(LSKEY_BOOKING_LUTS_SENT, timestamp.toString());
        }
    }

}