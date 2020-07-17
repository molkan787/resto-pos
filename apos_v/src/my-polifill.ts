// @ts-nocheck

String.prototype.capitalize = function (){
    return this.charAt(0).toUpperCase() + this.substr(1).toLowerCase();
}

Object.clone = obj => JSON.parse(JSON.stringify(obj));

Object.patch = (obj, patch) => {
    for(let p in patch){
        if(patch.hasOwnProperty(p)){
            obj[p] = patch[p];
        }
    }
}