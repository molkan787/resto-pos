import POSReceiptBuilder from '../Libs/POSReceiptBuilder';
import Printer from '../drivers/printer';
import utils from '../utils';
import config from '../config';

export default class ReportsPrint{

    static prb: POSReceiptBuilder;

    static state: any;

    static setup(context: any){
        this.state = context.state;
        this.prb = new POSReceiptBuilder({
            currency: config.app.currencySign,
            lineLength: 44,
            quantityLength: 6,
            totalLength: 8,
            itemInBigText: false,
            showItemPrice: false,
            showPrices: true,
        });
    }

    static printDailyStats(stats: any){
        const items = this.getDailyStatsItems(stats);
        const r = this.prb;
        r.clear();
        r._fontNormal();
        // r._line('Restaurant', 'center');
        r._line('', 'center');
        r._fontBig();
        r._line('Order Summary', 'center');
        r._fontNormal();
        r._separator();
        r._line(`End Of Day Summary - ${new Date().toLocaleDateString()}`, 'left');
        r._separator();
        r._item({
            name: 'Type',
            q: 'Total',
            total: 'Value'
        });
        r._separator();
        items.map(item => r._item({
            name: item.name,
            q: item.count.toString(),
            total: item.value.toFixed(2)
        }));
        r._separator();
        r._line(new Date().toLocaleString(), 'left');
        return Printer.print(r.getLines());
    }

    private static getDailyStatsItems(stats: any){
        const items = [];
        items.push({
            name: 'All',
            count: stats.cashCount + stats.cardCount,
            value: (stats.cash + stats.card) / 100
        });
        const types = ['cash', 'card', 'table', 'delivery', 'collection'];
        for(let type of types){
            items.push({
                name: type.capitalize(),
                count: stats[`${type}Count`],
                value: stats[type] / 100
            });
        }
        return items;
    }

}