// @ts-ignore
const ThermalPrinter = imp('node-thermal-printer').printer;
// @ts-ignore
const PrinterTypes = imp('node-thermal-printer').types;
// @ts-ignore
// const printer = imp('printer'); // FIX-BACK

class Printer{

    static printerInterface: string;

    static setup(printerInterface = ''){
        this.printerInterface = printerInterface;
    }

    static async test(printerInterface){
        this.setup(printerInterface);
        try {
            await this.connectPrinter();
            return true;
        } catch (error) {
            return false;
        }
    }

    static async connectPrinter(){
        const p = new ThermalPrinter({
            type: PrinterTypes.EPSON,          
            interface: this.printerInterface,
            driver: null, //printer,// FIX-BACK
            characterSet: 'SLOVENIA',          
            removeSpecialCharacters: false,        
            options: {                         
                timeout: 5000                  
            }
        });
        const connected = await p.isPrinterConnected();
        console.log('Printer connected:', connected);
        if(!connected){
            throw new Error('Couldn\'t connect printer');
        }
        return p;
    }

    static async print(lines: any){
        // @ts-ignore
        if(window.printToConsole){
            // console.clear();
            console.log('Printing to: ' + this.printerInterface);
            for(let line of lines){
                const lns = line.text.split("\n");
                for(let ln of lns){
                    const style = `font-weight:${line.bold?'bold':'normal'};font-size:${(line.font.x + 1) * 10}px;text-align:center;`;
                    console.log('%c' + ln, style);
                }
            }
            console.log('')
            console.log('')
            return;
        }

        const p = await this.connectPrinter();
        p.setTypeFontA();
        p.alignCenter();

        for(let line of lines){
            p.setTextSize(line.font.x, line.font.y);
            p.bold(!!line.bold);
            const lns = line.text.split("\n");
            for(let ln of lns){
                p.println(ln);
            }
        }
        
        p.cut();
        await p.execute();
    }

    static async openCashDrawer(){
        const p = await this.connectPrinter();
        p.openCashDrawer();
        await p.execute();
    }

}

// @ts-ignore
window.printer = Printer;
export default Printer;