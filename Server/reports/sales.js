const xlBuilder = require('../Helpers/xlBuilder');

module.exports = class Sales{

    static put(xb, { items, typeTotals }){
        this.prepare(xb);
        const l = items.length;
        for(let i = 0; i < l; i++){
            const o = items[i];
            xb.str(o.id + '');
            xb.str(o.date);
            xb.str(o.cashier);
            xb.str(o.order_type);
            xb.price_m(o.total);
            xb.str(o.payment);
            xb.price(o.discount);
            xb.str(o.discount_r);
            xb.price(o.values.extraCharge);
            xb.price(o.values.tips);
            xb.nextRow();
        }
        xb.ws.cell(1, 12).style(xb.styles.head).style(xb.fontStyle).string('Table Total');
        xb.ws.cell(1, 13).style(xb.styles.head).style(xb.fontStyle).string('Delivery Total');
        xb.ws.cell(1, 14).style(xb.styles.head).style(xb.fontStyle).string('Collection Total');
        xb.ws.column(12).setWidth(14);
        xb.ws.column(13).setWidth(14);
        xb.ws.column(14).setWidth(14);

        xb.setRow(2);
        xb.c_col = 12;
        xb.price_m(typeTotals.table);
        xb.price_m(typeTotals.delivery);
        xb.price_m(typeTotals.collection);
    }

    static prepare(xb){
        const head = [
            "ID", 2, "DATE & TIME", 3.5,
            "CASHIER ID", 2, "ORDER TYPE", 2, "ORDER VALUE", 2, "PAYMENT TYPE", 4,
            "DISCOUNT", 2, "DISCOUNT REASON", 3,
            "EXTRA CHARGES", 2, "TIPS", 2
        ];
        xb.head(head, xlBuilder.HEADINPUT_ALLINONE, []);
    }

}