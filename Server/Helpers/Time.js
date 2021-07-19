module.exports = class Time{

    /**
     * 
     * @param {Date} startTime Passing `null` as value will use current time
     * @param {number} minutesCount 
     * @returns 
     */
    static getMinutesInBetween(startTime, minutesCount){
        const result = [];
        startTime = startTime || new Date();
        let hs = startTime.getHours();
        let ms = startTime.getMinutes();
        for(let i = 0; i < minutesCount; i++){
            ms += i === 0 ? 0 : 1;
            if(ms >= 60){
                ms = 0;
                hs += 1;
            }
            if(hs >= 24){
                hs = 0;
            }
            const hh = ('0' + hs.toString()).substr(-2);
            const mm = ('0' + ms.toString()).substr(-2);
            result.push(
                `${hh}:${mm}`
            );
        }
        return result;
    }

    static getCurrentTimeStr(){
        return this.getTimeStr(new Date());
    }

    static getTimeStr(d){
        const hh = ('0' + d.getHours().toString()).substr(-2);
        const mm = ('0' + d.getMinutes().toString()).substr(-2);
        return `${hh}:${mm}`;
    }
    
    static dateToStr(date, separator = '-'){
        const _date = date || new Date();
        const dd = String(_date.getDate()).padStart(2, '0');
        const mm = String(_date.getMonth() + 1).padStart(2, '0'); //January is 0!
        const yyyy = _date.getFullYear();

        return yyyy + separator + mm + separator + dd;
    }

}