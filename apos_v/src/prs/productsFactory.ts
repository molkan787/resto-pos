// @ts-nocheck
import utils from './utils';
import consts from './consts';

export default class ProductsFactory{

    private static context: any;

    static setup(context: any){
        this.context = context;
    }

    static prepareFreeProduct(product){
        const srcId = product.id - 100000;
        const source = this.context.state.productsByIds[srcId];
        if(source){
            this.craftFreeProduct(source);
        }else{
            throw new Error('Source product not found');
        }
    }

    static craftFreeProduct(source){
        const newId = parseInt(source.id) + 100000;
        const existing = this.context.state.productsByIds[newId];
        if(existing){
            return existing;
        }else{
            const p = Object.clone(source);
            p.price = 0;
            p.id = newId;
            p.isFree = true;
            this.context.state.productsByIds[newId] = p;
            return p;
        }

    }

    static addPrepaidItem(barcode: string, clientData: any, amounts: any, isReload: boolean){
        const data = {
            id: isReload ? consts.reloadPrepaidCardItemId : consts.newPrepaidCardItemId,
            name: isReload ? consts.reloadPrepaidCardItemName : consts.newPrepaidCardItemName,
            product_type: consts.productWithTaxesType,
            price: utils.roundPrice(amounts.price),
            label: utils.price(amounts.amount),
            barcode,
            clientData,
            amount: utils.roundPrice(amounts.amount)
        }
        const POSstate = this.context.state.pos;
        if (POSstate.pay_method == 'prepaid') POSstate.pay_method = 'cash';
        POSstate.cantUsePrepaid = true;
        this.context.dispatch('addCustomItem', data);
    }

    static addGiftCertificateItem(data: any){
        const item = {
            id: consts.giftCertificateItemId,
            name: consts.giftCertificateItemName,
            product_type: consts.productWithTaxesType,
            price: utils.roundPrice(data.value),
            label: '#' + data.certId,
            data,
        }
        this.context.dispatch('addCustomItem', item);
    }

}