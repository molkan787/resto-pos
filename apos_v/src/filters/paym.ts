const pay_methods: any = {
    cash: 'Cash',
    prepaid: 'Prepaid Card',
    loyalty: 'Loyalty Card',
    invoice_ari: 'Invoice / Ari',
    card: 'Credit/Debit Card',
    other: 'Other / Free',
    cod: 'Cash on Delivery',
    online_card: 'Online Payment',
}
export function paym(name: string){
    return pay_methods[name] || '';
}

export function paym_detailed({ pay_method, order_details }){
    if(pay_method == 'cash'){
        const status = order_details.paid ? 'Paid' : 'Unpaid';
        return `Cash (${status})`;
    }else{
        return pay_methods[pay_method] || '';
    }
}