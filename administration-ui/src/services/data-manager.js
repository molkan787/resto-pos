import axios from 'axios';
const API_BASE_URL = 'http://localhost/admin'
export default class DataManager{

    static get API_BASE_URL(){
        return API_BASE_URL;
    }

    static get cache(){
        if(!this._cache) this._cache = {};
        return this._cache;
    }

    static async loadVendors(offset, limit){
        const url = `${API_BASE_URL}/vendors?offset=${offset}&limit=${limit}`;
        const { data } = await axios.get(url);
        this.cacheVendors(data.items, offset, limit);
        return data;
    }

    static async editVendor(vendor_id, data){
        const url = `${API_BASE_URL}/vendor/${vendor_id}`;
        const resp = await axios.post(url, data);
        this.updateVendorCache(vendor_id, resp.data.vendor);
        return resp.data;
    }

    static cacheVendors(vendors, offset, limit){
        const cache = this.cache;
        cache.vendors = vendors;
        cache.vendors_offset = offset;
        cache.vendors_limit = limit;
    }

    static updateVendorCache(vendor_id, vendor){
        const cache = this.cache;
        if(vendor_id == 'new'){
            if(cache.vendors_offset == 0){
                cache.vendors.unshift(vendor);
            }
        }
    }

}