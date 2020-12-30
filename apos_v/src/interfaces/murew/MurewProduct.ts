export interface MurewProduct{
    name: string;
    price: number;
    description?: string;
    category?: string;
    remote_id: number;
    enable_stock: boolean;
    stock: number;
    extras: any[];
    store_id?: string;
}