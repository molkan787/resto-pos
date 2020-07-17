import utils from '@/prs/utils';

export default {
    joinnames: (person: any) => `${person.first_name} ${person.last_name}`,
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
    }
}

// extractRawNumber(val: string){
//     return val.replace(/[^0-9]/g, '');
// }