import { MurewCategory } from "@/interfaces/murew/MurewCategory";
import { PosCategory } from "@/interfaces/pos/PosCategory";
import { PosProduct } from "@/interfaces/pos/PosProduct";
import { mapPosCategoriesToMurewCategories } from "./categories";
import { mapPosProductsToMurewProducts } from "./products";

export function mapPosMenuToMurewTreeMenu(categories: PosCategory[], products: PosProduct[]): MurewCategory[]{
    const posCatsParentsMap = new Map<number, number>();
    const murewCatsMap = new Map<number, MurewCategory>();
    const murewCats: MurewCategory[] = mapPosCategoriesToMurewCategories(categories);
    categories.forEach(cat => posCatsParentsMap.set(cat.id, cat.parent_id));
    murewCats.forEach(cat => murewCatsMap.set(cat.remote_id, cat));

    for(let i = murewCats.length - 1; i >= 0; i--){
        const cat = murewCats[i];
        const posParentId = posCatsParentsMap.get(cat.remote_id);
        const mCatParent = murewCatsMap.get(posParentId);
        if(mCatParent){
            mCatParent.children.push(cat);
            murewCats.splice(i, 1);
        }
    }

    const posProductsToMurewCatsMap = new Map<number, MurewCategory>();
    products.forEach(p => posProductsToMurewCatsMap.set(p.id, murewCatsMap.get(p.category_id)));
    const murewProducts = mapPosProductsToMurewProducts(products);
    for(const p of murewProducts){
        const mCat = posProductsToMurewCatsMap.get(p.remote_id);
        if(mCat){
            mCat.products.push(p);
        }
    }
    
    
    return murewCats;
}
