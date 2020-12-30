import { MurewCategory, MurewCategoryContentType } from "@/interfaces/murew/MurewCategory";
import { PosCategory, PosCategoryContentType } from "@/interfaces/pos/PosCategory";

export function mapPosCategoriesToMurewCategories(categories: PosCategory[]): MurewCategory[]{
    const result: MurewCategory[] = [];
    for(const category of categories){
        const mCategory: MurewCategory = {
            name: category.name,
            slug: category.name,
            menu: 'pos',
            type: category.ctype == PosCategoryContentType.Food ? MurewCategoryContentType.Food : MurewCategoryContentType.Drinks,
            products: [],
            children: [],
            remote_id: category.id,
        }
        result.push(mCategory);
    }
    return result;
}