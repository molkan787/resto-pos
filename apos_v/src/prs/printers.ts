import Printer from '../drivers/printer';
// @ts-ignore
// const PrinterDriver = imp('printer'); // FIX-BACK
const STORAGE_KEY_LIST = 'app_printers_list';
export default class Printers{

    private static _list: any[];

    static use(_printer){
        Printer.setup(_printer.printerInterface);
    }

    static load(){
        const rawList = window.localStorage.getItem(STORAGE_KEY_LIST) || '[]';
        const list = JSON.parse(rawList);
        this._list = list;
    }

    static save(){
        const rawList = JSON.stringify(this._list);
        window.localStorage.setItem(STORAGE_KEY_LIST, rawList);
    }

    static addPrinter(printer){
        this._list.push(printer);
        this.save();
        return true;
    }

    static removePrinter(printer){
        const index = this._list.indexOf(printer);
        if(index >= 0){
            this._list.splice(index, 1);
            this.save();
            return true;
        }else{
            return false;
        }
    }

    public static getAvailableUsbPrinters(){
        // return PrinterDriver.getPrinters(); // FIX-BACK
        return []
    }

    public static get list(){
        return this._list;
    }

}