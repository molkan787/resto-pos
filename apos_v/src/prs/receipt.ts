import POSReceiptBuilder from '../Libs/POSReceiptBuilder';
import Printer from '../drivers/printer';
import utils from '../utils';
import utils2 from './utils';
import things from '../prs/things';
import consts from './consts';
import config from '../config';
import store from '../store';

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
            itemInBigText: false,
            showItemPrice: false,
            showPrices,
        });
    }

    static printBar(order: any, frod?: Boolean){
        this.selectBuilder('other');
        this.my_print(order, frod, {
            itemsFilter: item => this.getCatCtype(item) == 2,
        });
    }

    static printKitchen(order: any, frod?: Boolean){
        this.selectBuilder('other');
        this.my_print(order, frod, {
            printKitchenMessage: true,
            itemsFilter: item => this.getCatCtype(item) == 1,
        });
    }

    static print(order: any, frod?: Boolean){
        this.selectBuilder('pos');
        this.my_print(order, frod);
    }

    static my_print(order: any, frod?: Boolean, options?: any){
        const { printKitchenMessage, itemsFilter } = options || {};
        if (frod) order = this.prepareROD(order);
        const [ date, _, time ] = utils.timestampToDate(order.date_added, 2, true).split(' ');
        const r = this.prb;
        r.clear();
        r.addHeader({
            title: 'Zaafran',
            subtitles: [
                "Romford,234 Main Rd",
                "01708743006"
            ],
            orderId: order.id,
            order_type: order.order_type,
            order_details: order.order_details,
            date,
            time,
            cashier: order.cashier.first_name + ' ' + order.cashier.last_name,
            client: (order.client && order.client.id) ? (order.client.first_name + ' ' + order.client.last_name) : 'WALKIN'
        }, true);
        
        const items = typeof itemsFilter == 'function' ? order.products.filter(itemsFilter) : order.products;
        const counts = order.counts;
        for(let i = 0; i < items.length; i++){
            const p = items[i];
            const c = counts[p.id];
            if(!c) continue;
            r.addItem({
                name: p.name,// + ' ' + this._getLabel(p),
                price: this._getPriceWithoutTaxes(p, order.taxes),
                q: c,
            });
        }
        if(order.totals.extraCharge){
            r.addItem({
                name: 'Extra charge',
                price: this._removeTaxes(order.totals.extraCharge, order.taxes),
                q: 0,
            });
        }

        const { kitchenMessage } = order.order_details;
        if(printKitchenMessage && kitchenMessage){
            r._separator();
            r._boldText();
            r._line('Message:');
            r._paragraph(kitchenMessage);
            r._regularText();
        }

        if(order.totals.discount){
            r.addTotalsItem({
                name: 'Discount',
                amount: this._removeTaxes(order.totals.discount, order.taxes),
            });
        }

        r.addTotalsItem({
            name: 'Sub-total',
            amount: order.totals.subTotal,
        });

        if(order.totals.tips){
            r.addTotalsItem({
                name: 'Tips',
                amount: order.totals.tips,
            });
        }

        // r.addTotalsItem({ name: 'VAT', amount: order.totals.taxGST, leftPadding: true });
        // r.addTotalsItem({ name: 'QST', amount: order.totals.taxQST, leftPadding: true });

        r.addTotalsItem({
            name: 'TOTAL',
            amount: order.totals.total,
        });

        const paym = order.pay_method;
        if(paym == 'cash'){
            r.addTotalsItem({ name: 'Cash', amount: order.totals.paidCash });
            r.addTotalsItem({ name: 'Change', amount: order.totals.changeDue });
        }else if(paym == 'card'){
            // r.addTotalsItem({ name: 'Comptant', text: 'Credit or Debit' });
        }else if(paym == 'prepaid'){
            r.addTotalsItem({ name: 'Comptant', text: 'CARTE PREPAYEE-' + order.payment.barcode.substr(-5) });
        }else if(paym == 'loyalty'){
            r.addTotalsItem({ name: 'Comptant', text: 'CARTE FIDELITE-' + order.payment.barcode.substr(-5) });
        }

        const { order_details, order_type } = order;

        let paymText;
        if(paym == 'cash'){
            const label = order_details.paid ? 'Paid' : 'Unpaid';
            paymText = `Cash (${label})`;
        }else{
            paymText = 'Credit/Debit Card';
        }
        r.addTotalsItem({ name: 'Payment Method', text: paymText });

        if(order_type != 'table'){
            r.addSpace();
            r.addSeparator();
            r.addSpace();
            const CENTER = 'center';
            const name = order_details.first_name + ' ' + (order_details.last_name || '');
            r._line('Customer Details:', CENTER);
            r._line(name, CENTER);
            if(order_details.phone) r._line(`Customer Phone: ${order_details.phone}`, CENTER);
            if(order_type == 'delivery'){
                r._line(`Delivery post code: ${order_details.postcode}`, CENTER);
                const addr2 = order_details.address_2 ? ', ' + order_details.address_2 : '';
                r._line(`Delivery Address:`, CENTER); 
                r._line(order_details.address_1 + addr2, CENTER);
                // r._line(order_details.city);
            }
        }

        const vat_number = this.state.vat_number.replace(/\s/g, '');
        if(vat_number){
            r.addSpace();
            r.addSeparator();
            r.addSpace();
            r._line(`VAT Number: ${vat_number}`, 'center');
            r.addSpace();
        }

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
        const cat = store.state.categoriesByIds[product.category_id];
        return cat.ctype || 1;
    }

}