// @ts-ignore
import Vue from 'vue';
import Vuex from 'vuex';
import Comu from './prs/comu';
import Utils from './utils';
import consts from './prs/consts';
import { OfferUtils } from 'murew-core';
import { Cart, OfferGetType } from 'murew-core/dist/interfaces';
import { OrderType } from 'murew-core/dist/types';

Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    demoMode: false,
    currentTime: '00:00',
    app: {
      showOrderTypeDetails: false,
      showProductsSearch: false,
    },
    settings: {
      murewSyncKey: null,
    },

    tablesState: {},

    categories: [],
    categoriesByIds: {},
    allCategories: [],
    products: {},
    productsByIds: {},
    productsArray: [],
    offers: [],

    data: {
      orders: [],
      clients: [],
      prepaid: [],
      loyalty: [],
      users: [],
    },
    dataState: {},
    filtersState: {
      orders: {},
      clients: {},
      prepaid: {},
      loyalty: {},
      offers: {}
    },

    //=======================
    recentOrders: [],
    onlineRecentOrders: [],
    defaultExactPaid: true,
    pos: {
      orderId: 0,
      orderNo: '',
      orderType: 'table',
      orderDetails: {
        paid: true,
        table: '',
        first_name: '',
        last_name: '',
        phone: '',
        address_1: '',
        address_2: '',
        postcode: '',
        city: '',
        kitchenMessage: '',
      },
      values: {
        fullDiscount: false,
        itemsTotal: 0,
        foodTotal: 0,
        drinksTotal: 0,
        discount: 0,
        percentDiscount: 0,
        percentDiscountCType: 1,
        extraCharge: 0,
        tips: 0,
        subTotal: 0,
        taxGST: 0,
        taxQST: 0,
        total: 0,
        paidCash: 0,
        changeDue: 0,
      },
      selectedOffer: null,
      offerOptions: {
        selectedItems: []
      },
      items: [],
      itemsCount: {},
      pay_method: 'cash',
      cantUsePrepaid: false,
      paid: false,
      finished: false,
      catType: 1,
    },
    payment: {},
    ticket: '',
    nextOrderId: 0,
    lastOrderDate: 0,
    lastOrderData: null,
    discountReason: '',
    freeOrderReason: '',
    extraChargeReason: '',

    actions: [],

    postingOrder: false,
    finalizeOrder: false,
    //=======================
    invoiceData: {
      clientName: '',
    },
    client: {
      id: 0,
      first_name: '',
      last_name: '',
      phone: '',
      email: '',
      want_receipt: false,
      history: []
    },
    loyaltyCard: {
      id: 0,
      barcode: '',
      balance: 0,
      updateCount: 0,
    },
    prepaidCard: {
      id: 0,
      barcode: '',
      balance: 0,
      updateCount: 0,
    },
    loyaltyPoints: -1,

    user: {
      id: 0,
      user_type: 100000,
      username: '',
      first_name: '',
      last_name: '',
      passwords: [],
    },

    receipt_msg: '',
    vat_number: '',
    tables_count: 1,
    persons_per_table: 4,
    order_types: {
      table: true,
      delivery: true,
      collection: true,
    },

    companies: [],

    stats: {cw: 0, pp: 0,  rpp: 0, dt: 0, cs: 0, cc: 0, cxc: 0, cxv: 0},
    dailyStats: {
      cash: 0,
      card: 0,
      table: 0,
      delivery: 0,
      collection: 0
    },

    areaAView: 'order',

    taxes: {
      gst: 0,
      qst: 0,
    },

    // =========================

    bookingSlots: {},

    bookings: []

    // bookings: {
    //   todays: [],
    //   other: [],
    //   loading: false,
    //   filterDate: '',
    // }

  },
  getters: {
    getCategory(state){
      // @ts-ignore
      return (catID: string) => state.categories.filter(category => category.id == catID)[0];
    },
    pos: state => state.pos,
    userType: state => state.user.user_type,
    murewCart: (state) => {
      const { itemsCount, orderType, selectedOffer } = state.pos;
      const products = {};
      for(let pid of Object.keys(itemsCount)){
        products[pid] = {
          qty: itemsCount[pid],
          note: '', extras: []
        }
      }
      const cart: Cart = {
        products,
        orderType: orderType == 'delivery' ? OrderType.Delivery : OrderType.Collection,
        delivery: 0,
        deliveryDistance: 0,
        selectedOffer: selectedOffer
      };
      return cart;
    },
    eligibleOffers: (state, getters) => {
      return OfferUtils.getEligibleOffers(state.offers, getters.murewCart, state.pos.values.itemsTotal);
    },
    offerItems: (state) => {
      const { productsByIds, pos: { offerOptions: { selectedItems } } } = state;
      return selectedItems.map(pid => ({
        pid: pid,
        name: productsByIds[pid].name + ' (Offer)',
      }))
    },
    allOrderItems: (state, getters) => {
      const { items: pos_items, itemsCount: pos_itemsCount, orderId } = state.pos;
      const items = Object.clone(pos_items), itemsCount = Object.clone(pos_itemsCount);
      const offerItems = getters.offerItems;
      offerItems.forEach(({ pid }) => {
          const p = Object.clone(state.productsByIds[pid]);
          const opid = 200000 + parseInt(pid);
          p.id = opid;
          p.price = 0;
          p.isFree = true;
          p.name += ' (Offer)';
          items.push(p);
          itemsCount[opid] = 1;
      });
      return {
        items,
        itemsCount
      }
    }
  },
  actions: {
    setup(context){
      Comu.setup(context);
    },

    updateCardBarcode({state}, payload: any){
      const {type, card} = payload;
      const s_card = type == 'prepaid' ? state.prepaidCard : state.loyaltyCard;
      if(s_card.id == card.id){
        s_card.barcode = card.barcode;
      }
    },
    
    updateCardBalance({state}, payload: any){
      const {type, card} = payload;
      const s_card = type == 'prepaid' ? state.prepaidCard : state.loyaltyCard;
      if(s_card.id == card.id){
        s_card.balance = card.balance;
      }
    },

    setReason({state}, payload: any){
      const {_of, reason} = payload;
      switch (_of) {
        case 'discount':
          state.discountReason = reason;
          break;
        case 'extra':
          state.extraChargeReason = reason;
          break;
        case 'free':
          state.freeOrderReason = reason;
          break;
        default:
          break;
      }
    },

    setCatType({state}, ctype: any){
      state.pos.catType = ctype;
    },

    setTicket({state}, val: any){
      state.ticket = val;
    },

    addProduct({state}, data: any){
        const id = data.id;
        const cat = data.category_id;

        Vue.set(state.productsByIds, id, data);
        // @ts-ignore
        state.productsArray.push(data);
        // @ts-ignore
        if(!state.products[cat]){
          Vue.set(state.products, cat, []);
        }
        // @ts-ignore
        state.products[cat].push(data);
    },

    setData({state}, payload: any){
      Vue.set(state.data, payload.name, payload.data);
      Vue.set(state.dataState, payload.name, true);
    },

    setClientId(context, clientId){
      // @ts-ignore
      let clientData: any = context.state.companies.filter(item => item.id == clientId);
      if(clientData.length) clientData = clientData[0];
      else clientData = null;

      const client = context.state.client;
      client.id = clientId;
      if(clientData){
        context.dispatch('setClientData', clientData);
      }
    },

    setClientData(context, clientData: any){
      const { client, pos } = context.state;
      const prepaid = context.state.prepaidCard;
      const { orderDetails } = pos;
      if(clientData){
        client.id = clientData.id || 0;
        client.first_name = clientData.first_name || '';
        client.last_name = clientData.last_name || '';
        client.phone = clientData.phone || '';
        client.email = clientData.email || '';
        client.want_receipt = clientData.want_receipt || false;
        client.history = clientData.history || [];

        const { details } = clientData;
        orderDetails.first_name = details.first_name || clientData.first_name || '';
        orderDetails.last_name = details.last_name || clientData.last_name || '';
        orderDetails.phone = details.phone || clientData.phone || '';
        orderDetails.address_1 = details.address_1 || '';
        orderDetails.address_2 = details.address_2 || '';
        orderDetails.city = details.city || '';
        orderDetails.postcode = details.postcode || '';

        if(!clientData.keepCards){
          const card = clientData.prepaid || {};
          prepaid.id = card.id || 0;
          prepaid.barcode = card.barcode || '';
          prepaid.balance = card.balance || 0;
          prepaid.updateCount++;
        }
      }
    },

    setLoyaltyCardIfEmpty({state}, card: any){
      const c = state.loyaltyCard;
      if(!c.id){
        c.id = card.id || 0;
        c.barcode = card.barcode || '';
        c.balance = card.balance || 0;
      }
    },

    endOrderPosting(context){
      context.state.postingOrder = false;
      if (context.state.pos.finished) Comu.reset();
    },
    markAsPaid(context){
      context.state.pos.paid = true;
    },
    markAsFinished(context){
      context.state.pos.finished = true;
    },
    resetPOS(context){
      const {state} = context;
      const pos = context.state.pos;
      const values = pos.values;
      pos.items = [];
      pos.itemsCount = {};
      pos.pay_method = 'cash';
      pos.cantUsePrepaid = false;
      pos.paid = false;
      pos.finished = false;
      pos.catType = 1;
      pos.orderId = 0;
      pos.orderNo = '';
      values.fullDiscount = false;
      values.itemsTotal = 0;
      values.discount = 0;
      values.percentDiscount = 0;
      values.extraCharge = 0;
      values.tips = 0;
      values.subTotal = 0;
      values.taxGST = 0;
      values.taxQST = 0;
      values.total = 0;
      values.paidCash = 0;
      values.changeDue = 0;

      // Reseting Products dynamic properties
      const items = context.state.productsArray;
      for(let i = 0; i < items.length; i++){
        const item: any = items[i];
        if(item.product_type == 2){
          item.price = 0;
          item.addTaxes = false;
        }
      }
      state.payment = {};
      state.ticket = '';
      state.discountReason =  '';
      state.freeOrderReason =  '';
      state.extraChargeReason = '';

      const client = context.state.client;
      client.id = 0;
      client.first_name = '';
      client.last_name = '';
      client.phone = '';
      client.email = '';
      client.want_receipt = false;
      client.history = [];

      state.loyaltyCard.id = 0;
      state.loyaltyCard.barcode = '';
      state.loyaltyCard.balance = 0;
      
      state.prepaidCard.id = 0;
      state.prepaidCard.barcode = '';
      state.prepaidCard.balance = 0;

      state.invoiceData.clientName = '';

      state.areaAView = 'order';
      state.defaultExactPaid = true;

      Vue.set(context.state, 'actions', []);
      const ots = state.order_types;
      let firstOrderType = ots.table ? 'table' : (ots.delivery ? 'delivery' : 'collection');
      state.pos.orderType = firstOrderType;
      Vue.set(state.pos, 'orderDetails',{
        paid: true,
        table: '',
        first_name: '',
        last_name: '',
        phone: '',
        address_1: '',
        address_2: '',
        postcode: '',
        city: state.pos.orderDetails.city,
        kitchenMessage: '',
      });

      state.app.showOrderTypeDetails = false;
      state.app.showProductsSearch = false;
    },
    clearOrderClientDetails({ state }){
      const { orderDetails } = state.pos;
      orderDetails.first_name = '';
      orderDetails.last_name = '';
      orderDetails.phone = '';
      orderDetails.address_1 = '';
      orderDetails.address_2 = '';
      orderDetails.city = '';
      orderDetails.postcode = '';
    },

    setItemCount(context, { itemId, count }){
      setItemCount(context, itemId, count, true);
    },
    setItemCountOne(context, itemId){
      setItemCount(context, itemId, 1, true);
    },
    incItemCount(context, itemId){
      setItemCount(context, itemId, 1, false);
    },
    decItemCount(context, itemId){
      setItemCount(context, itemId, -1, false);
    },
    setCustomPriceItem(context, {itemId, price, taxesIncluded}){
      // @ts-ignore
      const item = context.state.productsByIds[itemId];
      Vue.set(item, 'addTaxes', !taxesIncluded);
      if(price > 0){
        Vue.set(item, 'price', price);
        setItemCount(context, itemId, 1, true);
      }else{
        Vue.set(item, 'price', 0);
        setItemCount(context, itemId, 0, true);
      }
    },
    addCustomItem(context, itemData){
      // @ts-ignore
      context.state.productsByIds[itemData.id] = itemData;
      setItemCount(context, itemData.id, 1, true);
    },

    // POS Values
    setTips(context, value){
      context.state.pos.values.tips = value;
      context.dispatch('updateValues');
    },
    setExtraCharge(context, {value, reason}){
      context.state.pos.values.extraCharge = value;
      context.state.extraChargeReason = reason;
      context.dispatch('updateValues');
    },
    setDiscount(context, payload){
      const value = (typeof payload == 'object') ? payload.value : payload;
      const values = context.state.pos.values;
      values.percentDiscount = 0;
      if(value == 'full'){
        values.discount = -values.itemsTotal;
        values.fullDiscount = true;
      }else{
        values.discount = parseFloat(value) * -1;
        values.fullDiscount = false;
      }
      context.state.discountReason = payload.reason || '';
      context.dispatch('updateValues');
    },
    setPercentDiscount(context, payload){
      const { value, reason, ctype } = payload;
      const values = context.state.pos.values;
      values.fullDiscount = false;
      values.discount = 0;
      values.percentDiscount = parseFloat(value);
      context.state.discountReason = reason || '';
      context.dispatch('updateValues');
    },
    setPaidCash(context, value){
      context.state.pos.values.paidCash = value;
      context.dispatch('updateChangeDue');
    },
    updateValues(context){
      const state = context.state;
      const getCType = product => {
        const cat = state.categoriesByIds[product.category_id];
        return (cat && cat.ctype) || 1;
      }
      const {values, items, itemsCount} = state.pos;
      values.foodTotal = 0;
      values.drinksTotal = 0;
      let total = 0;
      let totalExludingTaxes = 0;
      let extraGst = 0;
      let extraQst = 0;
      for(let i = 0; i < items.length; i++){
        const item: any = items[i];
        const ltotal = item.price * itemsCount[item.id];
        if(getCType(item) == 1){
          values.foodTotal += ltotal;
        }else{
          values.drinksTotal += ltotal;
        }
        if(item.product_type == consts.productWithoutTaxesType){
          totalExludingTaxes += ltotal;
        }else if(item.addTaxes){
          item.taxes = (state.taxes.gst + state.taxes.qst) * item.price;
          extraGst += ltotal * state.taxes.gst;
          extraQst += ltotal * state.taxes.qst;
          totalExludingTaxes += ltotal;
        }else{
          total += ltotal;
        }
      }
      total += values.extraCharge;

      values.itemsTotal = total + values.tips + extraGst + extraQst + totalExludingTaxes;
      if(values.fullDiscount){
        values.discount = -values.itemsTotal;
      }else if(values.percentDiscount > 0){
        const ctype = values.percentDiscountCType;
        const amount = ctype == -1 ? values.itemsTotal : (ctype == 1 ? values.foodTotal : values.drinksTotal);
        values.discount = -amount * values.percentDiscount / 100;
      }

      total += values.discount;

      const totalTaxRate = state.taxes.gst + state.taxes.qst;
      let subTotal = total / (totalTaxRate + 1);
      const taxes = (total - subTotal) / totalTaxRate;
      const gst = taxes * state.taxes.gst;
      const qst = taxes * state.taxes.qst;
      subTotal += totalExludingTaxes;

      values.subTotal = subTotal;
      values.taxGST = gst + extraGst;
      values.taxQST = qst + extraQst;
      values.total = total + values.tips + extraGst + extraQst + totalExludingTaxes;

      if(state.defaultExactPaid){
        Comu.setExactPaid();
      }else{
        context.dispatch('updateChangeDue');
      }
    },

    updateChangeDue(context){
      const values = context.state.pos.values;
      values.changeDue = Utils.round(values.paidCash - values.total);
    },

    // View state
    setAreaAView({state}, viewName: string){
      if(state.areaAView !== viewName){
        state.areaAView = viewName;
      }
    }
  },
});

function setItemCount(context: any, itemId: number, amount: number, forceAmount: boolean){
  const itemsCount = context.state.pos.itemsCount;
  const product = context.state.productsByIds[itemId];
  const items = context.state.pos.items;
  
  let count = itemsCount[itemId];
  if(forceAmount) count = 0;

  if(count) count += amount;
  else count = amount;
  if(count < 0) count = 0;
  else if(count > 99) count = 99;

  if(product.stock_enabled && count > product.stock){
    count = product.stock;
  }

  Vue.set(itemsCount, itemId, count);

  const itemIndex = items.indexOf(product);

  if(itemsCount[itemId] > 0){
    if(itemIndex == -1) items.unshift(product);
  }else if(itemIndex !== -1){
    items.splice(itemIndex, 1);
  }

  context.dispatch('updateValues');
  context.dispatch('setAreaAView', 'order');
}

export default store;

const OFFER_DISCOUNT_REASON = '%%%offer%%%';

store.watch(
  state => state.pos.selectedOffer,
  (offerId) => {
    store.state.pos.offerOptions.selectedItems = [];
    const offer = offerId ? store.getters.eligibleOffers.find(o => o.id == offerId) : null;
    if(offer && offer.benefits[0].type == OfferGetType.PercentDiscount){
      store.dispatch('setPercentDiscount', { value: offer.benefits[0].percent_amount, reason: OFFER_DISCOUNT_REASON })
    }else if(store.state.pos.values.percentDiscount > 0 && store.state.discountReason == OFFER_DISCOUNT_REASON){
      store.dispatch('setPercentDiscount', { value: 0, reason: '' });
    }
  }
);

store.watch(
  (s, getters) => getters.eligibleOffers,
  (offers) => {
    const { selectedOffer } = store.state.pos;
    if(selectedOffer && !offers.find(o => o.id == selectedOffer)){
      store.state.pos.selectedOffer = null;
    }
  }
);