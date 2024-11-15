import utils from '@/prs/utils';

const capitalize = (val: string | undefined) => {
    return typeof val == 'string' ? val.charAt(0).toUpperCase() + val.substr(1).toLowerCase() : val;
}

export default {
    joinnames: (person: any) => `${capitalize(person.first_name)} ${capitalize(person.last_name)}`,
    yesIfTrue: (val: any) => val ? 'Yes' : '',
    pol_barcode: (card: any) => {
        if(card && card.barcode && typeof card.barcode == 'string'){
            return card.barcode;
        }
        return '---';
    },
    phone: (num: string) => {
        if(num == '55555555555' || num == '00000000000')
            return 'NO TEL.';
        return utils.formatPhoneNumber(num);
    },
    orderTicket: (obj: any) => {
        return obj.ticket;
    },
    percent: (val: number) => {
        return (val + '').trim() + '%';
    },
    capitalize: capitalize,
    capitalizeAll: (val: string) => {
        if(typeof val == 'string'){
            return val.split(' ').map(w => capitalize(w)).join(' ');
        }else{
            return val;
        }
    },
    date(date: any){
        const d = typeof date == 'string' && date.length ? new Date(date) : date;
        return d instanceof Date ? d.toLocaleDateString() : date;
    }
}

// extractRawNumber(val: string){
//     return val.replace(/[^0-9]/g, '');
// }