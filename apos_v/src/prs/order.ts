import { arrayToMap } from "murew-core/dist/DataUtils";

export class OrderLogics{

    static getOrdersItemsDiff(originalOrder: any, updatedOrder: any){
        const { products: orProducts, counts: orCounts } = originalOrder.items;
        const { products: upProducts, counts: upCounts } = updatedOrder.items;
        const products = arrayToMap(orProducts.concat(upProducts), 'id').values(); // merging two array and eliminating duplicates
        const diff = {
            products: [],
            counts: {}
        }
        for(let p of products){
            const orCount = orCounts[p.id] || 0;
            const upCount = upCounts[p.id] || 0;
            const countDiff = upCount - orCount;
            if(countDiff != 0){
                diff.products.push(Object.clone(p));
                diff.counts[p.id] = countDiff;
            }
        }
        return diff;
    }

}