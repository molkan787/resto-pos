
Object.clone = obj => JSON.parse(JSON.stringify(obj));

Object.patch = (obj, patch) => {
    for(let p in patch){
        if(patch.hasOwnProperty(p)){
            obj[p] = patch[p];
        }
    }
    return obj;
}