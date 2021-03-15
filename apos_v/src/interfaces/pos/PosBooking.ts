import { BookingCategory, BookingStatus } from "../murew/MurewBooking";

export interface PosBooking{
    id: number;
    no: string;
    date: string;
    time: string;
    number_of_persons: number;
    category: BookingCategory;
    status: BookingStatus;
    comment: string;
    customer_name: string;
    customer_phone: string;
    client_id: number;
    client?: any;
    created_at?: number;
    updated_at?: number;
}