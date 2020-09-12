const Factory = require('./factory');
const time = require('../utils/time');
const wb = require('../utils/whereBuilder');
const Order = require('../models/Order');
const Stats = require('../models/Stats');
const utils = require('../utils/utils');
const consts = require('./consts');
const Action = require('../Actions/Action');
const AC = require('../Actions/ActionConsts');
const DailyReports = require('./dailyReports');
const WeeklyReports = require('./weeklyReports');
const Other = require('./other');
const mkdirp = require('mkdirp');
const path = require('path');

mkdirp(path.join(global.TempDir, 'files'));

module.exports = class Reports {

    static async genDailyStats(day){
        try {
            const cond = wb.dateRange({date_from: day, date_to: day}, null, 'status = 1');
            const orders = await Order.query().select(['total', 'pay_method']).whereRaw(cond);
            const cashouts = await Action.getBulkByTypeDateRange(AC.TYPE_CASHOUT, day, day);
            const data = this.prepareDailyStats(orders, cashouts);

            return data;
        } catch (error) {
            console.log(error);
            return false;
        }
    }

    static async genDailyReports(day){
        try {
            const cond = wb.dateRange({date_from: day, date_to: day}, null, 'status = 1');
            const orders = await Order.query().eager('[cashier, transaction.[prepaid, loyalty]]').whereRaw(cond);
            const cashouts = await Action.getBulkByTypeDateRange(AC.TYPE_CASHOUT, day, day);
            const data = this.prepareDailySummaryData(orders, cashouts);
            const sales = this.prepareDailySalesData(orders);
            const date = time.timestampToDate(day);

            return await DailyReports.gen({...data, date}, sales)
        } catch (error) {
            console.log(error);
            return false;
        }
    }

    static async genWeeklyReports(date_from, date_to){
        try {
            const cond = wb.dateRange({ date_from, date_to }, 'date_added', 'status = 1');
            const cond2 = wb.dateRange({ date_from, date_to }, 'day', '', true);
            const orders = await Order.query().eager('[cashier, transaction.[prepaid, loyalty]]').whereRaw(cond);
            const stats = await Stats.query().whereRaw(cond2);

            const _summary = this.prepareWeeklySummaryData(orders, stats, date_from, date_to);
            const _sales = this.prepareDailySalesData(orders);

            return await WeeklyReports.gen(_summary, _sales);
        } catch (error) {
            console.log(error);
            return false;
        }
    }

    static async genLoyaltyPointsAdding(date_from, date_to) {
        try {
            const actions = await Action.getBulkByTypeDateRange(
                AC.TYPE_LOYALTY_POINT_ADD_AFTER_SALE,
                date_from, date_to,
                'loyalty'
            );

            return await Other.loyaltyPoints(actions);
        } catch (error) {
            console.log(error);
            return false;
        }
    }

    static async genBalancesAdjust(date_from, date_to, card_type){
        const isPP = card_type == 'prepaid';
        const eagerName = isPP ? 'prepaid' : 'loyalty';
        const axType = isPP ? AC.TYPE_PREPAID_BALANCE_ADJUST : AC.TYPE_LOYALTY_BALANCE_ADJUST;
        try {
            const actions = await Action.getBulkByTypeDateRange(
                axType,
                date_from, date_to,
                `[user, ${eagerName}]`
            );

            return await Other.cardsBalanceAdjustment(actions, card_type);
        } catch (error) {
            console.log(error);
            return false;
        }
    }

    static prepareDailyStats(orders, cashouts){
        // const cashout = cashouts.reduce((current, co) => current + co.s1, 0);
        let cash = 0, card = 0;
        for(let i = 0; i < orders.length; i++){
            const { total, pay_method } = orders[i];
            if(pay_method == 'cash') cash += total;
            else if(pay_method == 'card') card += total;
        }
        // cash -= cashout;
        return {
            cash,
            card
        }
    }

    static prepareDailySummaryData(orders, cashouts){
        let totalCashout = 0;
        for(let cashout of cashouts){
            totalCashout += cashout.s1 // s1 is the action's slot containing the amount taken out
        }
        totalCashout /= 100;
        const totals = Factory.genPayMethodMap();
        const sales = {
            washes: 0,
            extras: 0,
            ppWashes: 0,
            ppExtras: 0,
            prepaid: 0,
            others: 0,
            detailing: 0,
            certificate: 0,
            discount: 0,
            tips: 0,
        };
        const data = {
            totals,
            totalCashout,
            prepaids: [],
            loyalties: [],
            washesAmount: 0,
            discount: 0,
            tips: 0,
            tipsCash: 0,
            extraCharge: 0,
            newPrepaids: [],
            newPrepaidsTotal: 0,
            detailingTotal: 0,
            sales,
        };

        for(let i = 0; i < orders.length; i++){
            const order = orders[i];
            const paym = order.pay_method;
            totals[paym] += order.total / 100;
            const prepaidCards = this.getPrepaidCards(order);
            const values = this.extractValues(order);
            data.discount += order.totals.discount || 0;
            data.tips += values.tips || 0;
            data.extraCharge += (order.totals.extraCharge || 0);
            data.newPrepaids.push(...prepaidCards.barcodes);
            data.newPrepaidsTotal += prepaidCards.total;

            sales.others += values.others;
            sales.prepaid += values.prepaid;
            sales.discount += values.discount;
            sales.tips += values.tips;

            if(paym == 'cash'){
                data.tipsCash += values.tips;
            }
        }
        return data;        
    }

    static prepareWeeklySummaryData(orders, stats, date_from, date_to){
        const map = Factory.genDaysMap(date_from, date_to, wsr_template, {modifier: wsr_modifier});

        for(let i = 0; i < orders.length; i++){
            const order = orders[i];
            const dayTime = time.getDateKey(order.date_added);
            const day = map.days[dayTime];
            // const paid = orders.order_details && orders.order_details.paid;
            // if(!paid) continue;

            switch (order.pay_method) {
                case 'cash':
                    day.cash += order.total;
                    break;
                case 'card':
                    day.credit += order.total;
                    break;
                case 'invoice_ari':
                    day.invoice_ari += order.total;
                    break;
                case 'prepaid':
                    day.prepaid += order.total;
                    break;
                case 'loyalty':
                    day.loyalty += order.total;
                    break;
                case 'other':
                    day.freeWashesValue += order.total;
                    break;
                default:
                    break;
            }

            const values = this.extractValues(order);
            day.washes += values.washes;
            day.ppWashes += values.ppWashes;
            day.extra += values.extras;
            day.ppExtra += values.ppExtras;
            day.detailingTotal += values.detailing;
            day.others += values.others;
            day.certificate += values.certificate;
            day.discount += order.totals.discount;
            day.extraCharge += order.totals.extraCharge;
            day.tips += order.totals.tips;
            day.newPrepaid += this.getPrepaidCards(order).total;
        }

        for(let i = 0; i < stats.length; i++){
            const stat = stats[i];
            const day = map.days[stat.day];
            if(!day) continue;
            day.cw = stat.cw;
            day.pp = stat.pp;
            day.rpp = stat.rpp;
            day.dt = stat.dt;
        }

        return map.list;
    }

    static prepareDailySalesData(orders){
        const items = [];
        const typeTotals = {
            table: 0,
            delivery: 0,
            collection: 0,
        };
        for(let i = 0; i < orders.length; i++){
            const order = orders[i];
            const type = order.order_type || 'table';
            typeTotals[type] += order.total;
            const row = {}; //this.extractItems(order);
            row.values = this.extractValues(order);
            row.id = order.id;
            row.date = time.timestampToDate(order.date_added, true);

            row.order_type = this.capitalizeString(order.order_type);
            row.cashier = order.cashier.username;
            row.total = order.total;
            row.payment = this.getPaymentText(order);
            row.discount = order.totals.discount;
            row.discount_r = (order.other_data.reasons || {}).discount || ' --- ';

            items.push(row);
        }
        return {
            typeTotals,
            items,
        };
    }

    // .................Helpers.................

    static capitalizeString(str){
        return str.charAt(0).toUpperCase() + str.substr(1);
    }

    static getPaymentText(order){
        const paym = order.pay_method;
        const tx = order.transaction;
        if(paym == 'prepaid' && tx){
            return 'PREPAID: ' + (tx.prepaid || {}).barcode || 'xxxx';
        }else if(paym == 'loyalty' && tx){
            return 'LOYALTY: ' + (tx.loyalty || {}).barcode || 'xxxx';
        }else if(paym == 'other'){
            const reason = (order.other_data.reasons || {}).free || '';
            return Factory.getPaymText('other') + "\nReason: \"" + reason + '"';
        }else if(paym == 'cash'){
            const label = !(order.order_details && order.order_details.paid) ? ' (Unpaid)' : '';
            return `Cash${label}`;
        }else{
            return Factory.getPaymText(order.pay_method);
        }
    }

    static getAssociatedCard(transaction){
        if(transaction){
            if(transaction.xtype == 'prepaid'){
                return transaction.prepaid;
            }else if(transaction.xtype == 'loyalty'){
                return transaction.loyalty;
            }
        }else{
            throw new Error('Transaction argument is Null or Undefined');
        }
    }

    static extractValues(order){
        const products = order.items.products;
        const counts = order.items.counts;
        let washes = 0;
        let extras = 0;
        let ppWashes = 0;
        let ppExtras = 0;
        let prepaid = 0;
        let others = 0;
        let detailing = 0;
        let certificate = 0;
        const discount = parseFloat(order.totals.discount);
        const tips = parseFloat(order.totals.tips);
        const extraCharge  = parseFloat(order.totals.extraCharge);

        for(let i = 0; i < products.length; i++){
            const p = products[i];
            const cat = parseInt(p.category_id);
            const c = parseInt(counts[p.id] || 0);
            const price = parseFloat(p.price) * c;
            if(cat == 1 || cat == 2){
                washes += price;
            }else if(cat == 6 || cat == 7){
                ppWashes += price;
            }else if(cat == 3){
                detailing += price;
            }else if(cat == 4){
                extras += price;
            }else if(cat == 8){
                ppExtras += price;
            }else if(cat == 5){
                others += price;
            }else if(p.id == pids.newPrepaidCardItemId || p.id == pids.reloadPrepaidCardItemId){
                prepaid += price;
            }else if(p.id == pids.giftCertificateItemId){
                certificate += price;
            }
        }
        return { washes, extras, ppWashes, ppExtras, detailing, prepaid, others, certificate, discount, tips, extraCharge};
    }

    static getPrepaidCards(order){
        const barcodes = [];
        let total = 0;
        const products = order.items.products;
        for(let i = 0; i < products.length; i++){
            const p = products[i];
            if(p.id == 10001 || p.id == 10002){
                barcodes.push(p.barcode);
                total += p.amount;
            }
        }
        return {barcodes, total};
    }

    static extractItems(order){
        const result = {washes: [], extras: [], newPrepaids: [], reloadPrepaids: [], detailing: [], otheritems: [], certificates: []};
        const products = order.items.products;
        const counts = order.items.counts;
        for(let i = 0; i < products.length; i++){
            const p = products[i];
            const cat = p.category_id;
            const c = counts[p.id] || 0;
            addPrt(result, p, c);
        }
        return result;
    }

    static getOrderStats(order, cancelling){
        const { total, pay_method } = order;
        const stats = {
            cw: 0,
            pp: 0,
            rpp: 0,
            dt: 0,
            cs: pay_method == 'cash' ? total : 0,
            cc: pay_method == 'card' ? total : 0,
            cxc: cancelling ? -1 : 0,
            cxv: cancelling ? -total : 0
        }

        const products = order.items.products;
        const counts = order.items.counts;
        for(let i = 0; i < products.length; i++){
            const item = products[i];
            const c = counts[item.id];
            if(item.id == consts.newPrepaidCardItemId){
                stats.pp += c;
            }else if(item.id == consts.reloadPrepaidCardItemId){
                stats.rpp += c;
            }else if(item.category_id == 3){
                stats.dt += c;
            }else if(consts.washesCats.includes(item.category_id)){
                stats.cw += c;
            }
        }
        return stats;
    }

}

function addPrt(obj, p, c){
    const cat = p.category_id;
    if(cat == 1 || cat == 6){
        obj.washes.push(p.name + ' (IN & OUT)' + gct(c));
    }else if(cat == 2 || cat == 7){
        obj.washes.push(p.name + ' (IN OR OUT)' + gct(c));
    }else if(cat == 3){
        obj.detailing.push(`${p.name} (${utils.price(p.price)})`);
    }else if(cat == 4 || cat == 8){
        obj.extras.push(p.name + gct(c));
    }else if(cat == 5){
        obj.otheritems.push(p.name + gct(c));
    }else if(p.id == pids.newPrepaidCardItemId){
        obj.newPrepaids.push(`${p.barcode} (${utils.price(p.amount)})`)
    }else if(p.id == pids.reloadPrepaidCardItemId){
        obj.reloadPrepaids.push(`${p.barcode} (${utils.price(p.amount)})`)
    }else if(p.id == pids.giftCertificateItemId){
        obj.certificates.push(`#${p.data.certId}  (${utils.price(p.price)})`)
    }
}

function gct(c){
    return (c > 1) ? ' x' + c : '';
}

const wsr_template = {
    date: '',
    cw: 0,
    pp: 0,
    rpp: 0,
    dt: 0,
    cash: 0,
    credit: 0,
    cash_plus_credit: 0,
    cash_vs_credit: 0,
    freeWashesValue: 0,
    invoice_ari: 0,
    prepaid: 0,
    loyalty: 0,
    washes: 0,
    ppWashes: 0,
    extra: 0,
    ppExtra: 0,
    others: 0,
    discount: 0,
    tips: 0,
    extraCharge: 0,
    newPrepaid: 0,
    detailingTotal: 0,
    certificate: 0,
};

function wsr_modifier(obj, day){
    if(day == 'sum'){
        obj.date = 'TOTAL';
    }else{
        obj.date = time.timestampToDate(day);
    }
}

const pids = {
    newPrepaidCardItemId: 10001,
    reloadPrepaidCardItemId: 10002,
    giftCertificateItemId: 10003,
};