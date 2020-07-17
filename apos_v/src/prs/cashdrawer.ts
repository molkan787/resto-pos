import Printer from '@/drivers/printer';
import Printers from './printers';

export default class CashDrawer{

    static async open(){
        try {
            const pos_printers = Printers.list.filter(p => p.used_for == 'pos');
            for(let p of pos_printers){
                Printers.use(p);
                Printer.openCashDrawer();
            }
        } catch (error) {
            console.log('Error opening cash drawer');
            console.error(error);
        }
    }

}