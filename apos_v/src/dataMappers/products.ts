import { MurewProduct } from "@/interfaces/murew/MurewProduct";
import { PosProduct } from "@/interfaces/pos/PosProduct";

export function mapPosProductsToMurewProducts(products: PosProduct[]): MurewProduct[]{
    const result: MurewProduct[] = [];
    for(const product of products){
        const mProduct: MurewProduct = {
            name: product.name,
            price: product.price / 100, // POS products uses integers instead if decimals (ex: 1200 = $12.00)
            remote_id: product.id,
            enable_stock: !!product.stock_enabled,
            stock: product.stock,
            extras: []
        }
        result.push(mProduct);
    }
    return result;
}