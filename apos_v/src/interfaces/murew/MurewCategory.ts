import { MurewProduct } from "./MurewProduct";

export interface MurewCategory{
    name: string;
    slug: string;
    parent?: MurewCategory;
    menu: 'pos' | 'online';
    type: MurewCategoryContentType;
    products: MurewProduct[];
    children: MurewCategory[];
    remote_id: number;
    store_id?: string;
}

export enum MurewCategoryContentType{
    Food = 'food',
    Drinks = 'drinks'
}