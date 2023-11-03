// @ts-nocheck
import Vue from 'vue';
import axios from 'axios';
import _url from '@/prs/api';
import FormData from 'form-data';
import ProductsFactory from './productsFactory';
import Utils from '@/utils';
import { Offer } from 'murew-core/dist/interfaces';
import store from '@/store';
import { services } from '@/services';
import { PosBooking } from '@/interfaces/pos/PosBooking';
import { mapBookingSlotsObjectToArray } from './helpers';

export default class DM{

    private static comu: any;
    private static context: any;
    private static data: any;
    private static cache: any;

    public static setup(context: any, comu: any){
        this.context = context;
        this.comu = comu;
        this.cache = context.state.data;
        window.dm = this;
    }

    public static async getBookedSlots(month: string){
        const { data } = await axios.get(_url(`booked_slots?month=${month}`));
        const ppt = this.context.state.persons_per_table || 4;
        for(let timeSlots of Object.values(data)){
            for(let [time, bookings] of Object.entries(timeSlots)){
                timeSlots[time] = bookings.reduce((t, ps) => t + Math.ceil(ps / ppt), 0);
            }
        }
        return data;
    }

    public static async setBookingSlots(slotsMap: any){
        const slots = mapBookingSlotsObjectToArray(slotsMap);
        await axios.put(_url('booking_slots'), { booking_slots: slots });
        this.context.state.bookingSlots = Object.clone(slotsMap);
        services.instances.bookingsService.syncBookingSlots();
    }

    public static async createBooking(bookingData: any){
        const { data } = await axios.post(_url('bookings'), bookingData);
        try {
            services.instances.bookingsService.syncBookings();
        } catch (error) {
            console.error(error);
        }
        return data;
    }

    public static syncBookings(bookings: any[]){
        return axios.put(_url('bookings/sync'), { bookings });
    }

    /**
     * @param id Booking id or No
     * @param data Booking's data to update
     * @param byNo Whether to refer by booking number instead of id
     * @returns {Promise<any>}
     */
    public static async updateBooking(ref: number | string, data: Partial<PosBooking>, byNo: boolean = false){
        const response = (
            byNo ? await axios.put(_url(`bookings/${ref}?byNo=true`), data)
                 : await axios.put(_url(`bookings/${ref}`), data)
        )
        services.instances.bookingsService.sendBookings().catch(err => console.error(err));
        return response;
    }
    
    public static async editOffer(offer: Offer){
        const { offers } = store.state;
        if(offer.id){
            await axios.put(_url(`offers/${offer.id}`), offer);
            const local = offers.find(o => o.id == offer.id);
            if(local){
                Object.patch(local, offer);
            }
        }else{
            const { data } = await axios.post(_url(`offers`), offer);
            offers.push(data.offer);
        }
        services.onMenuChanged();
    }

    public static async deleteOffer(offerId: string){
        await axios.delete(_url(`offers/${offerId}`));
        const { offers } = store.state;
        const index = offers.findIndex(o => o.id == offerId);
        if(index >= 0){
            offers.splice(index, 1);
        }
    }

    public static async loadOrder(orderId){
        const { data } = await axios.get(_url(`pos/get_order/${orderId}`));
        console.log('loadOrder:', data.order)
        const { id, no, client_id, order_details, order_type, pay_method, totals, items, other_data } = data.order;
        for(let p of items.products){
            if(typeof p.id === 'string' && p.id.length > 15){
                Vue.set(this.context.state.productsByIds, p.id, p)
            }
        }
        this.comu.reset();
        const { pos, client } = this.context.state;
        client.id = client_id;
        pos.orderId = id;
        pos.orderNo = no;
        pos.pay_method = pay_method;
        pos.orderType = order_type;
        Object.patch(pos.orderDetails, order_details);
        Object.patch(pos.values, totals);
        const { products, counts, notes } = items;
        pos.minimumItemsCount = Object.clone(counts);
        pos.itemsNote = Object.clone(notes);
        for(let p of products){
            const itemId = p.id;
            const count = counts[itemId] || 0;
            if(itemId > 100000){
                ProductsFactory.prepareFreeProduct(p);
            }
            this.context.dispatch('setItemCount', {
                itemId,
                count
            })
        }
        const { discount, extra, free } = other_data.reasons;
        pos.discountReason = discount;
        pos.freeOrderReason = free;
        pos.extraChargeReason = extra;
    }

    public static async getOrderData(orderId){
        const { data } = await axios.get(_url(`pos/get_order/${orderId}`));
        return data.order;
    }

    public static async recordCashout(amount: any){
        const day = Utils.todaysTimestamp();
        const { data } = await axios.post(_url('cashout'), { amount, day });
        if(data.status == 'OK'){
            return true;
        }else{
            throw data.cause;
        }
    }


    public static getClientData(payload: any){
        const {id, phone} = payload;
        if(id){
            return this._getClientData('id', id);
        }else if(phone){
            return this._getClientData('phone', phone);
        }else{
            return Promise.reject();
        }
    }

    public static async editClient(payload: any){
        const {data} = await axios.post(_url('client'), payload);
        if(data.status == 'OK'){
            this.setToCache('clients', payload, data);
            return data;
        }else{
            throw data.cause;
        }
    }

    public static async deleteClient(payload: any){
        const {data} = await axios.delete(_url(`client/${payload.id}`));
        if(data.status == 'OK'){
            this.removeFromCache('clients', payload.id);
            return true;
        }else{
            throw new Error(`Unknow error, Response status: "${data.status}"`);
        }
    }

    public static async editSettings(payload: any){
        const {data} = await axios.post(_url('settings'), payload);
        if(data.status == 'OK'){
            this.comu.putSettings(payload);
            return true;
        }else{
            throw new Error(`Unknow error, Response status: "${data.status}"`);
        }
    }

    public static async editCardBalance(payload: any){
        const {data} = await axios.post(_url('editCardBalance'), payload);
        if(data.status == 'OK'){
            return true;
        }else{
            throw new Error(`Unknow error, Response status: "${data.status}"`);
        }
    }
    
    public static async editCardBarcode(payload: any){
        const {data} = await axios.post(_url('editCardBarcode'), payload);
        if(data.status == 'OK'){
            return true;
        }else{
            throw data.cause;
        }
    }

    public static async deleteCard(payload: any){
        const {data} = await axios.post(_url(payload.type + '/del'), payload);
        if(data.status == 'OK'){
            this.removeFromCache(payload.type, payload.id);
            return true;
        }else{
            throw new Error(`Unknow error, Response status: "${data.status}"`);
        }
    }

    public static async refundOrder(payload: any){
        const {data} = await axios.post(_url('order/refund'), payload);
        if(data.status == 'OK'){
            this.comu.updateStats(data.stats, true);
            return true;
        }else{
            throw new Error(`Unknow error, Response status: "${data.status}"`);
        }
    }

    public static async addLoyaltyPoints(payload: any){
        payload.user = this.context.state.user;
        const { data } = await axios.post(_url('loyalty/addPoints'), payload);
        if (data.status == 'OK') {
            if (this.context.state.loyaltyCard.id == payload.cardId){
                this.context.state.loyaltyCard.balance += payload.amount;
            }
            return true;
        } else {
            throw new Error(`Unknow error, Response status: "${data.status}"`);
        }
    }

    public static async sendFile(payload: any){
        const file = payload.file;
        const data = new FormData();
        data.append('file', file, file.name);

        const resp = await axios.post(_url('import/' + payload.dest), data, {
            headers: {
                'accept': 'application/json',
                'Accept-Language': 'en-US,en;q=0.8',
                'Content-Type': `multipart/form-data; boundary=${data._boundary}`,
            }
        });

        if(resp.data.status == 'OK'){
            return true;
        }else{
            throw new Error(`Unknow error, Response status: "${resp.data.status}"`);
        }

    }

    public static async genExportDataFile(payload: any){
        const {data} = await axios.post(_url('export/' + payload.dataName), payload);
        if(data.status == 'OK'){
            return data;
        }else{
            throw new Error(`Unknow error, Response status: "${data.status}"`);
        }
    }

    // -----------------------------------

    private static _getClientData(by: string, ref: any){
        return new Promise(async (resolve, reject) => {
            try {
                let client = this.getFromCache('clients', by, ref);
                if(client){
                    resolve(client);
                }else{
                    const response = await axios.get(_url(`client/${by}/${ref}`));
                    const data = response.data.data;
                    resolve(data);
                }
            } catch (error) {
                reject(error);
            }
        });
    }


    private static getFromCache(dataName: string, filterProp: string, ref: any, multiple?: boolean){
        const data = this.cache[dataName];
        const result = data.filter((item: any) => item[filterProp] == ref);
        if(multiple)
            return result;
        else
            return result.length ? result[0] : null;
    }

    private static setToCache(dataName: string, originData: any, newData: any){
        const data = this.cache[dataName];
        const id = originData.id;
        if(newData.isNew){
            data.unshift(newData);
        }else{
            for(let i = 0; i < data.length; i++){
                const item = data[i];
                if(item.id == id){
                    this.putValues(item, originData);
                    break;
                }
            }
        }
    }

    private static removeFromCache(dataName: string, identifier: any){
        const data = this.cache[dataName];
        const index = data.findIndex((item: any) => item.id == identifier);
        if(index != -1){
            data.splice(index, 1);
        }
    }

    private static putValues(obj: any, values: any){
        for(let k in values){
            if(!values.hasOwnProperty(k)) continue;
            Vue.set(obj, k, values[k]);
        }
    }


}