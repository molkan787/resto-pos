import POSReceiptBuilder from '../Libs/POSReceiptBuilder';
import Printer from '../drivers/printer';
import utils from '../utils';
import utils2 from './utils';
import things from '../prs/things';
import consts from './consts';
import config from '../config';
import store from '../store';
import { OrderType } from 'murew-core/dist/types';
import { getDateTimeValue } from 'murew-core/dist/DateUtils';

export default class Receipt{

    static prb: POSReceiptBuilder;
    static receiptBuilders: {
        pos: POSReceiptBuilder,
        other: POSReceiptBuilder,
    }

    static state: any;

    static setup(context: any){
        this.state = context.state;
       this.receiptBuilders = {
            pos:  this.setupReceiptBuilder(true),
            other:  this.setupReceiptBuilder(false),
       }
       this.selectBuilder('pos');
    }

    static selectBuilder(type){
        const _type = type == 'pos' ? 'pos' : 'other';
        const builder = this.receiptBuilders[_type];
        this.prb = builder;
    }

    static setupReceiptBuilder(showPrices){
        return new POSReceiptBuilder({
            currency: config.app.currencySign,
            lineLength: 44,
            itemInBigText: !showPrices,
            showItemPrice: false,
            showPrices,
        });
    }

    static printBar(order: any, frod?: Boolean){
        this.selectBuilder('other');
        this.my_print(order, frod, {
            itemsFilter: item => this.getCatCtype(item) == 2,
            target: 'bar'
        });
    }

    static printKitchen(order: any, frod?: Boolean){
        this.selectBuilder('other');
        this.my_print(order, frod, {
            printKitchenMessage: true,
            itemsFilter: item => this.getCatCtype(item) == 1,
            target: 'kitchen'
        });
    }

    static print(order: any, frod?: Boolean){
        this.selectBuilder('pos');
        this.my_print(order, frod);
    }

    static my_print(order: any, frod?: Boolean, options?: any){
        const { printKitchenMessage, itemsFilter, target = 'pos' } = options || {};
        if (frod) order = this.prepareROD(order);
        // const [ date, _, time ] = utils.timestampToDate(order.date_added, 2, true).split(' ');
        const { order_details, order_details: { preorder }, order_type, totals } = order;
        const { store_name, store_phone, store_address, receipt_message } = store.state.sharedSettings;
        const { line1, line2, city, postcode } = store_address || {};
        const address = [line1, line2, city, postcode].filter(p => !!p);
        const isOnline = order.no.charAt(0) == 'N';
        const r = this.prb;
        r.clear();
        if(target == 'pos'){
            r.addHeader({
                title: store_name,
                subtitles: address.concat(store_phone && ['Tel: ' + store_phone] || [])
            });
        }else{
            r.addHeader({
                title: target.toUpperCase(),
                subtitles: []
            });
        }

        const ORDER_TYPES_TEXTS = {
            [OrderType.Table]: 'DINE IN',
            [OrderType.Collection]: 'PICKUP',
            [OrderType.Delivery]: 'DELIVERY'
        }
        const orderType = ORDER_TYPES_TEXTS[order_type];

        r._fontBig();
        if(preorder){
            const action = order_type == OrderType.Collection ? 'Pickup' : 'Delivery';
            const date = new Date(preorder.date).toLocaleDateString();
            const time = preorder.time.split(':').slice(0, 2).join(':');
            // r._line(order_type.toUpperCase(), 'center');
            r._line(`${action} ${date} at ${time}`, 'center');
        }
        r._line(`Order No: ${order.no}`, 'center');
        if(isOnline){
            r._line('ONLINE ORDER', 'center');
        }
        r._fontNormal();
        r._separator();
        r._fontBig();
        r._line(orderType, 'center');
        r._fontNormal();
        r._separator();
        if(order_details.waiter && order_type == OrderType.Table){
            r._fontBig();
            r._line(`Server: ${order_details.waiter}`, 'center');
            r._fontNormal();
            r._separator();
        }
        r._emptyLine();

        
        
        const items = typeof itemsFilter == 'function' ? order.products.filter(itemsFilter) : order.products;
        if(items.length < 1) return;
        const counts = order.counts;
        if(target == 'kitchen' || target == 'bar'){
            r._fontBig();
        }
        for(let i = 0; i < items.length; i++){
            const p = items[i];
            const c = counts[p.id];
            if(!c) continue;
            r.addItem({
                name: p.name,// + ' ' + this._getLabel(p),
                price: this._getPriceWithoutTaxes(p, order.taxes),
                q: c,
                note: p.note
            });
        }
        if(order.totals.extraCharge){
            r.addItem({
                name: 'Extra charge',
                price: this._removeTaxes(order.totals.extraCharge, order.taxes),
                q: 0,
            });
        }
        r._fontNormal();



        r.addTotalsItem({
            name: 'Sub Total',
            amount: totals.subTotal,
        });

        if(totals.discount){
            r.addTotalsItem({
                name: 'Discount',
                amount: totals.discount,
            });
        }
        
        if(totals.foodTotal){
            r.addTotalsItem({
                name: 'Food',
                amount: totals.foodTotal,
            });
        }

        if(totals.drinksTotal){
            r.addTotalsItem({
                name: 'Drink',
                amount: totals.drinksTotal,
            });
        }
        
        if(totals.delivery_cost && order_type == OrderType.Delivery){
            r.addTotalsItem({
                name: 'Delivery Charge',
                amount: totals.delivery_cost,
            });
        }

        if(totals.tips){
            r.addTotalsItem({
                name: 'Tips',
                amount: totals.tips,
            });
        }

        r.addTotalsItem({
            name: 'Total to pay',
            amount: totals.total,
        });
        r._emptyLine();

        const paym = order.pay_method;
        // if(paym == 'cash'){
        //     r.addTotalsItem({ name: 'Cash', amount: order.totals.paidCash });
        //     r.addTotalsItem({ name: 'Change', amount: order.totals.changeDue });
        // }else if(paym == 'card'){
        //     // r.addTotalsItem({ name: 'Comptant', text: 'Credit or Debit' });
        // }else if(paym == 'prepaid'){
        //     r.addTotalsItem({ name: 'Comptant', text: 'CARTE PREPAYEE-' + order.payment.barcode.substr(-5) });
        // }else if(paym == 'loyalty'){
        //     r.addTotalsItem({ name: 'Comptant', text: 'CARTE FIDELITE-' + order.payment.barcode.substr(-5) });
        // }

        if(isOnline){
            let paymText;
            if(paym == 'cod'){
                paymText = `PAY ON ${orderType}`;
            }else if(paym == 'online_card'){
                paymText = 'ORDER PAID ONLINE';
            }
            if(paymText){
                r._fontNormal();
                r._separator();
                r._fontBig();
                r._line(paymText, 'center');
            }
        }

        const { kitchenMessage } = order.order_details;
        if(printKitchenMessage && kitchenMessage){
            r._separator();
            r._boldText();
            r._line('Message:');
            r._paragraph(kitchenMessage);
            r._regularText();
        }
        if(kitchenMessage){
            r._fontNormal();
            r._separator();
            r._line('Customer notes:');
            r._paragraph(kitchenMessage);
        }

        if(order_type != 'table'){
            const name = order_details.first_name + ' ' + (order_details.last_name || '');
            r._fontNormal();
            r._separator();
            r._line('Customer Info:');
            r._emptyLine();
            r._line(name);
            if(order_type == 'delivery'){
                const ds = order_details;
                [ds.address_1, ds.address_2, ds.city, ds.postcode]
                .filter(p => !!p).forEach(p => r._line(p));
            }
            if(order_details.phone){
                r._line(`${order_details.phone}`);
            }
        }

        if(receipt_message && target == 'pos'){
            r._emptyLine();
            r._paragraph(receipt_message, 'center');
            r._emptyLine();
        }

        const orderTime = getDateTimeValue(new Date(order.date_added * 1000));
        r._separator();
        r.addTotalsItem({
            name: 'Order Time',
            amount: orderTime
        }, true);
        // const vat_number = this.state.vat_number.replace(/\s/g, '');
        // if(vat_number){
        //     r.addSpace();
        //     r.addSeparator();
        //     r.addSpace();
        //     r._line(`VAT Number: ${vat_number}`, 'center');
        //     r.addSpace();
        // }

        return Printer.print(r.getLines());
    }

    static prepareROD(data){
        data.products = data.items.products;
        data.counts = data.items.counts;
        data.taxes = (data.other_data && data.other_data.taxes) ? data.other_data.taxes : {gst: 0, qst: 0};
        return data;
    }

    static _getLabel(p: any){
        // @ts-ignore
        const label = things.prefix[p.category_id] || p.label;
        if(label){
            return `(${label})`;
        }else{
            return '';
        }

    }

    static _getPriceWithoutTaxes(p: any, taxes: any){
        if(p.product_type == consts.productWithoutTaxesType || p.addTaxes){
            return p.price;
        }else{
            return this._removeTaxes(p.price, taxes);
        }
    }

    static _removeTaxes(value: any, taxes: any){
        const totalTaxRate = taxes.gst + taxes.qst;
        return value / (totalTaxRate + 1);
    }

    static getCatCtype(product){
        const { category_type, category_id } = product;
        if(typeof category_type == 'string'){
            return category_type == 'food' ? 1 : 2;
        }
        const cat = store.state.categoriesByIds[category_id] || {};
        return cat.ctype || 1;
    }

}