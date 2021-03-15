export interface MurewBooking{
    no: string;
    store_id: string;
    customer_name: string;
    customer_phone: string;
    owner?: any;
    date: string;
    time: string;
    number_of_persons: number;
    category: BookingCategory;
    status: BookingStatus;
    comment: string;
    createdAt?: string;
    updatedAt?: string;
}

export enum BookingCategory{
    Breakfast = 'breakfast',
    Lunch = 'lunch',
    Dinner = 'dinner',
}

export enum BookingStatus{
    Booked = 'booked',
    Canceled = 'canceled',
}