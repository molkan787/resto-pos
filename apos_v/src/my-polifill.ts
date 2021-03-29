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

Object.copy = (obj, props) => {
    const result = {};
    for(let i = 0; i < props.length; i++){
        const p = props[i];
        result[p] = obj[p];
    }
    return result;
}

declare global{
    interface Object{
        clone: <T>(obj: T) => T
    }
    interface String{
        capitalize(): string;
    }
}
export {};