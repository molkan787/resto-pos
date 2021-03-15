export function mapBookingSlotsArrayToObject(slots: any): any{
    const map = {};
    for(let slot of slots){
        map[slot.day] = slot.time_slots;
    }
    return map;
}

export function mapBookingSlotsObjectToArray(slotsMap: any): any[]{
    const slots = [];
    for(let [day, time_slots] of Object.entries(slotsMap)){
        slots.push({
            day,
            time_slots
        })
    }
    return slots;
}