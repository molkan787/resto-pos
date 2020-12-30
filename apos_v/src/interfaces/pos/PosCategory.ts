export interface PosCategory{
    id: number;
    parent_id: number;
    childs_type: number;
    name: string;
    icon?: string;
    ctype: PosCategoryContentType;
    date_modified: number;
}

export enum PosCategoryContentType{
    Food = 1,
    Drinks = 2
}