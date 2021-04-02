import { MurewBooking } from "@/interfaces/murew/MurewBooking";
import { PosBooking } from "@/interfaces/pos/PosBooking";

export function mapMurewBookingToPosBooking(booking: MurewBooking): PosBooking{
    const { owner, updatedAt, createdAt, ...b } = booking;
    return {
        id: undefined,
        no: b.no,
        date: b.date,
        time: b.time.split(':').slice(0, 2).join(':'),
        number_of_persons: b.number_of_persons,
        category: b.category,
        status: b.status,
        comment: b.comment,
        client_id: 0,
        customer_name: (owner || {}).fullname || b.customer_name || '',
        customer_phone: (owner || {}).phone || b.customer_phone || '',
        // created_at: createdAt ? Math.floor(new Date(createdAt).getTime() / 1000): 0,
        // updated_at: updatedAt ? Math.floor(new Date(updatedAt).getTime() / 1000): 0,
    }
}

export function mapPosBookingToMurewBooking(booking: PosBooking): MurewBooking{
    const { client, ...b } = booking;
    let customer_name = '';
    let customer_phone = '';
    if(client){
        customer_name = [client.first_name, client.last_name].filter(n => !!n).join(' ');
        customer_phone = client.phone || ''; 
    }
    return {
        no: b.no,
        date: b.date,
        time: b.time + ':00.000',
        number_of_persons: b.number_of_persons,
        category: b.category,
        status: b.status,
        comment: b.comment,
        store_id: '',
        customer_name: customer_name || b.customer_name || '',
        customer_phone: customer_phone || b.customer_phone || '',
        createdAt: b.created_at ? new Date(b.created_at * 1000).toJSON() : undefined,
        updatedAt: b.updated_at ? new Date(b.updated_at * 1000).toJSON() : undefined,
    }
}