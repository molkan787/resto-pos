export default class Utils {
    static round(value: number){
        return Math.round(value * 100) / 100;
    }

    static getCurrentTime(){
        var today = new Date();
        var h = today.getHours();
        var m = today.getMinutes();
        
        m = this.checkTime(m);
        h = this.checkTime(h);
        return h + ":" + m;
    }

    static checkTime(i: any) {
        if (i < 10) {
          i = "0" + i;
        }
        return i;
    }

    static timestampToDate(unixtimestamp: any, includeTime?: any, numMonths?: boolean){
        // Months array
        const months_arr = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        // Convert timestamp to milliseconds
        const date = new Date(unixtimestamp*1000);
        const year = date.getFullYear();
        const month = numMonths ? ('0'+(date.getMonth() + 1)).substr(-2) : months_arr[date.getMonth()];
        const day = "0" + date.getDate();
        const hours = "0" + date.getHours();
        const minutes = "0" + date.getMinutes();
        const seconds = "0" + date.getSeconds();
       
        const sc = numMonths ? '-' : ' ';
        let convdataTime = day.substr(-2) + sc + month + sc + year;
        if(includeTime)
            convdataTime += ' - ' + hours.substr(-2) + ':' + minutes.substr(-2);
            if(includeTime == 2){
                convdataTime += ':' + seconds.substr(-2);
            }

        return convdataTime;
    }

    static dateToTimestamp(dateString: string){
        const str = dateString.replace(/-/g, '/');
        return (new Date(str)).getTime() / 1000;
    }

    static todaysDate(separator = '/'){
        const today = new Date();
        const dd = String(today.getDate()).padStart(2, '0');
        const mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        const yyyy = today.getFullYear();

        return yyyy + separator + mm + separator + dd;
    }

    static todaysTimestamp(){
            return this.dateToTimestamp(this.todaysDate());
    }

    static getDateValueFromDate(date){
        const _date = typeof date == 'string' ? new Date(date) : date;
        const dd = String(_date.getDate()).padStart(2, '0');
        const mm = String(_date.getMonth() + 1).padStart(2, '0'); //January is 0!
        const yyyy = _date.getFullYear();
        return `${yyyy}-${mm}-${dd}`;
    }
    
    static getTimeValueFromDate(date){
        const _date: Date = typeof date == 'string' ? new Date(date) : date;
        const hh = String(_date.getHours()).padStart(2, '0');
        const mm = String(_date.getMinutes()).padStart(2, '0'); //January is 0!
        return `${hh}:${mm}`;
    }


    static getFilenameExtension(filename: string){
        const parts = filename.split('.');
        return parts[parts.length - 1];
    }

    static debounce(callback, wait) {
        let timeout;
        return (...args) => {
            const context = this;
            clearTimeout(timeout);
            timeout = setTimeout(() => callback.apply(context, args), wait);
        };
    }

}

export function slugify(str) {
    return String(str)
      .normalize('NFKD') // split accented characters into their base characters and diacritical marks
      .replace(/[\u0300-\u036f]/g, '') // remove all the accents, which happen to be all in the \u03xx UNICODE block.
      .trim() // trim leading or trailing whitespace
      .toLowerCase() // convert to lowercase
      .replace(/[^a-z0-9 -]/g, '') // remove non-alphanumeric characters
      .replace(/\s+/g, '-') // replace spaces with hyphens
      .replace(/-+/g, '-'); // remove consecutive hyphens
}

export function randomString(length) {
    var result           = '';
    var characters       = 'abcdefghijklmnopqrstuvwxyABCDEFGHIJKLMNOPQRSTUVWXYZz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}