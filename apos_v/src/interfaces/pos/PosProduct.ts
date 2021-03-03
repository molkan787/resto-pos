export interface PosProduct{
    id: number;
    category_id: number;
    name: string;
    price: number;
    stock_enabled: number;
    stock: number;
    product_type: number;
    contains_allergens: boolean;
    date_modified: number;
    sort_no: number;
}