const xlBuilder = require('../Helpers/xlBuilder');

module.exports = class Summary{

    static put(xb, days){
        this.prepare(xb);
        for(let i = 0; i < days.length; i++){
            const row = i + 2;
            const day = days[i];
            xb.str(day.date);

            xb.price_m(day.cash);
            xb.price_m(day.credit);
            xb.formula(`B${row}+C${row}`)
            xb.price(day.extraCharge);
            xb.price(day.discount);
            xb.price(day.tips);
            xb.nextRow()
        }

        xb.c_row += 3;
        xb.resetCol();
        xb.str('TOTAL');
        // xb.c_col += 4;

        const r = xb.c_row - 1;
        const seq = 'BCDEFG';
        for(let i = 0; i < seq.length; i++){
            const c = seq.charAt(i);
            xb.style('price');
            xb.formula(`SUM(${c}2:${c}${r})`);
        }
    }

    static prepare(xb){
        const head = [
            "DATE", 3, "CASH", 2, "CREDIT/ DEBIT", 2,
            "TOTAL OF ALL PAYMENT METHODS", 2, "EXTRA CHARGES", 2,
            "DISCOUNT", 2, "TIPS", 2
        ]
        xb.head(head, xlBuilder.HEADINPUT_ALLINONE, []);
    }

}