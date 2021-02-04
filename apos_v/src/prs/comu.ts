// @ts-nocheck
import config from '@/config';
import axios from 'axios';
import time from './time';
import _url from './api';
import Products from './dcr/products';
import Categories from './dcr/categories';
import Clients from './dcr/clients';
import ProductsFactory from './productsFactory';
import PredefinedOrder from './predefinedOrder';
import MxHelper from './MxHelper';
import Dl from './dl';
import Ds from './ds';
import DM from './dm';
import Login from './login';
import ClientLoader from './clientLoader';
import consts from './consts';
import Utils from './utils';
import extUtils from '@/utils';
import Receipt from './receipt';
import LocalSettings from './localSettings';
import Printers from './printers';
import Reports from './reports';
import { services } from '../services';
import * as srv from '../services';

console.log(Object.values(srv));

export default class Comu {

    private static context: any;
    private static objectsToReset: any[];
    private static prevState: any;
    private static interval: Number;
    private static apiToken: string = '';
    public static services = services;

    public static settings: typeof LocalSettings;

    static setup(context: any) {
        this.context = context;
        this.objectsToReset = [];
        ProductsFactory.setup(context);
        PredefinedOrder.setup(context);
        ClientLoader.setup(context);
        Dl.setup(context);
        Ds.setup(context);
        DM.setup(context, this);
        Receipt.setup(context);
        Login.setup(context, this);

        this.settings = LocalSettings;
        this.settings.load();

        Printers.load();

        this.updateTime();
        this.interval = setInterval(() => {
            this.updateTime();
        }, 15000);

        if (config.debug || true) {
            // @ts-ignore
            window.$store = context;
            // @ts-ignore
            window.$receipt = Receipt;
            this.loadData();
            Login.setUser({
                token: '',
                user: {
                    username: 'system',
                    user_type: 1,
                    id: 1,
                }
            });
            // @ts-ignore
            window.state = context.state;
            // @ts-ignore
            window.comu = this;
        }
        this.reset();

        services.init()
            .then(() => console.log('Services initiated!'));
    }

    static setToken(token: string) {
        this.apiToken = token;
        axios.defaults.headers.common['Authorization'] = token;
    }

    static setPaymentDetails(data: any) {
        this.context.state.payment = data;
    }

    static activatePrepaidCard(barcode: string, clientData: any, balance: number) {
        return new Promise((resolve, reject) => {
            const _data = {
                barcode,
                clientData,
                balance: Utils.preparePrice(balance),
            };
            axios.post(_url('prepaid/add'), _data).then(({ data }) => {
                if (data.status == 'OK') {
                    this.context.state.actions.push(data.actionId);
                    resolve(true);
                } else {
                    reject(data.cause);
                }
            }).catch(error => {
                reject(error);
            });
        });
    }

    static reloadPrepaidCard(barcode: string, amount: number) {
        return new Promise((resolve, reject) => {
            const data = {
                barcode,
                amount: Utils.preparePrice(amount),
            };
            axios.post(_url('prepaid/reload'), data).then(({ data }) => {
                if (data.status == 'OK') {
                    this.context.state.actions.push(data.actionId);
                    resolve(true);
                } else {
                    reject(data.cause);
                }
            }).catch(error => {
                reject(error);
            });
        });
    }

    static activateLoyaltyCard(barcode: string, clientData: any) {
        return new Promise((resolve, reject) => {
            const data = {
                barcode,
                clientData,
            };
            axios.post(_url('loyalty/add'), data).then(({ data }) => {
                if (data.status == 'OK') {
                    resolve(data);
                } else {
                    reject(data.cause);
                }
            }).catch(error => {
                reject(error);
            });
        });
    }

    static getInvoiceId() {
        return this.context.state.nextOrderId;
    }

    static loadData() {
        return new Promise((resolve, reject) => {
            axios.get(_url('asd')).then(response => {
                const data = response.data;
                const state = this.context.state;
                const cats = Categories.mapCategories(data.categories);
                state.categories = cats.list;
                state.categoriesByIds = cats.byIds;
                state.allCategories = data.categories;
                state.products = Products.mapByCategory(data.products, true);
                state.productsByIds = Products.mapById(data.products, false);
                state.productsArray = data.products;
                state.stats = data.stats;
                state.nextOrderId = data.orderPtr;
                state.companies = Clients.prepareData(data.companies);
                this.putSettings(data.settings);
                services.onDataLoaded(data);
                resolve(true);
            }).catch(error => {
                reject(error);
            })
        });
    }

    static reset() {
        this.context.dispatch('resetPOS');
        this.resetObjects();
    }

    static canRequestPayment() {
        return (!this.context.state.pos.paid && !this.context.state.pos.finished && this.context.state.postingOrder);
    }

    static resetStatus() {
        const state = this.context.state;
        state.pos.paid = false;
        state.pos.finished = false;
        state.postingOrder = false;
    }

    static getOrderTotal() {
        return Utils.preparePrice(this.context.state.pos.values.total);
    }

    static getUser(userId: any) {
        const users = this.context.state.data.users.filter((user: any) => user.id == userId);
        return users.length ? users[0] : null;
    }

    public static putSettings(settings: any) {
        const state = this.context.state;
        if (settings.gst) state.taxes.gst = settings.gst;
        if (settings.qst) state.taxes.qst = settings.qst;
        if (settings.vat_number) state.vat_number = settings.vat_number;
        if (settings.receipt_msg) state.receipt_msg = settings.receipt_msg;
        if (settings.order_types) state.order_types = settings.order_types;
        state.tables_count = parseInt(settings.tables_count) || 10;
    }

    // ==================================

    static startSubmission(finalizeOrder) {
        this.context.state.postingOrder = true;
        this.context.state.finalizeOrder = finalizeOrder;
        // @ts-ignore
        MxHelper.openPayment();
    }

    static postOrder() {
        return new Promise((resolve, reject) => {
            const state = this.context.state;
            const { items, itemsCount, orderId } = state.pos;
            const total = Utils.preparePrice(state.pos.values.total);
            const orderData = {
                order_type: state.pos.orderType,
                order_details: state.pos.orderDetails,
                user_id: state.user.id,
                client_id: state.client.id,
                total,
                totals: state.pos.values,
                items: {
                    products: state.pos.items,
                    counts: state.pos.itemsCount
                },
                other_data: {
                    ticket: state.ticket,
                    reasons: {
                        discount: state.discountReason,
                        extra: state.extraChargeReason,
                        free: state.freeOrderReason,
                    },
                    taxes: state.taxes,
                },
                pay_method: state.pos.pay_method,
                receipt: 0,
            };
            const stats = this.getStats(items, itemsCount, state.pos.pay_method, total);
            const data = {
                orderData,
                stats,
                payment: state.payment,
                invoiceData: state.invoiceData,
                loyaltyCardId: state.loyaltyCard.id,
                actions: state.actions,
                cards: {
                    prepaid: state.prepaidCard.id,
                    loyalty: state.loyaltyCard.id,
                },
                taxes: state.taxes,
            }
            const endpoint = orderId ? `pos/edit_order/${orderId}` : 'order';
            axios.post(_url(endpoint), data).then(({ data }) => {
                if (data.status == 'OK') {
                    orderData.no = data.orderNo;
                    state.lastOrderDate = data.date_added;
                    state.loyaltyPoints = data.loyaltyPoints;
                    this.setCardsBalances(data.balances);
                    this.backupState();
                    this.setToRecentOrders(data.orderId, orderData);
                    this.setTableState();
                    resolve(orderData);
                    Reports.loadDailyStats();
                    services.onOrderPosted(orderData);
                } else {
                    reject(data.cause);
                }
            }).catch(error => {
                reject(error);
            });
        });
    }

    static async postOnlineOrder(order) {
        const state = this.context.state;
        const { type, total: _total, products, id: onlineOrderId, owner, no, delivery_address, menu, payment_method } = order;
        const paymentMethod = payment_method || 'cod';
        const isPOSMenu = menu == 'pos';
        const items = {
            products: [],
            counts: {}
        };
        for(let p of products){
            const _id = isPOSMenu ? p.remote_id : p.pid;
            items.products.push({
                id: _id,
                name: p.name,
                price: p.unit_price || p.price,
                note: p.note,
                product_type: 1,
                date_modified: 0,
            });
            items.counts[_id] = p.quantity;
        }
        const [first_name, last_name] = owner.fullname.split(' ');
        const client = {
            first_name,
            last_name,
            email: owner.email,
            phone: owner.phone
        };
        const total = Utils.preparePrice(_total);
        const orderData = {
            no: no,
            order_type: type,
            order_details: {
                first_name: first_name,
                last_name: last_name,
                phone: owner.phone,
                address_1: delivery_address.line1 || '',
                address_2: delivery_address.line2 || '',
                postcode: delivery_address.postcode || '',
                city: delivery_address.city || '',
                kitchenMessage: '',
                paid: false,
                table: "",
            },
            user_id: 0,
            client_id: 0,
            total,
            totals: {
                changeDue: 0,
                discount: 0,
                drinksTotal: 0,
                extraCharge: 0,
                foodTotal: _total,
                fullDiscount: false,
                itemsTotal: _total,
                paidCash: _total,
                percentDiscount: 0,
                percentDiscountCType: 1,
                subTotal: _total,
                taxGST: NaN,
                taxQST: NaN,
                tips: 0,
                total: _total,
            },
            items: items,
            other_data: {
                client,
                onlineOrderId: onlineOrderId,
                ticket: '',
                reasons: {
                    discount: '',
                    extra: '',
                    free: '',
                },
                taxes: state.taxes,
            },
            pay_method: paymentMethod,
            receipt: 0,
        };
        const postOrderData = {
            skipStockAdjustement: !isPOSMenu,
            orderNo: no,
            orderData,
            stats: {},
            payment: paymentMethod,
            invoiceData: {},
            loyaltyCardId: 0,
            actions: [],
            cards: {
                prepaid: 0,
                loyalty: 0,
            },
            taxes: state.taxes,
        }
        // const endpoint = orderId ? `pos/edit_order/${orderId}` : 'order';
        const { data } = await axios.post(_url('order'), postOrderData);
        if (data.status == 'OK') {
            state.lastOrderDate = data.date_added;
            state.loyaltyPoints = data.loyaltyPoints;
            this.setCardsBalances(data.balances);
            this.backupState();
            this.setToRecentOrders(data.orderId, orderData)
            // this.setTableState();
            Reports.loadDailyStats();
            services.onOrderPosted(orderData);
            return orderData;
        } else {
            throw data.cause;
        }
    }

    static printOrderReceipt(orderData){
        const od = orderData;
        // axios.post(_url('setReceiptFlag'), {order_id}).catch(() => {});
        const receipt = {
            id: od.id,
            no: orderData.no,
            order_type: orderData.order_type,
            order_details: od.order_details,
            date_added: state.lastOrderDate,
            cashier: null,
            client: od.other_data.client || {},
            products: od.items.products,
            counts: od.items.counts,
            totals: od.totals,
            pay_method: od.pay_method,
            payment: {},
            loyaltyCard: { id: 0 },
            prepaidCard: { id: 0 },
            taxes: state.taxes,
        };
        return this.printReceiptInAllPrinters(receipt);
    }

    static setTableState() {
        const { tablesState, pos, finalizeOrder } = this.context.state;
        const { orderDetails, orderType, orderId } = pos;
        if (orderType != 'table') return;
        if (!orderDetails.table) return;
        tablesState[orderDetails.table] = !finalizeOrder;
    }

    static setToRecentOrders(orderId, orderData) {
        const { recentOrders, finalizeOrder } = this.context.state;
        const { total, no, order_type } = orderData;
        const index = recentOrders.findIndex(o => o.id == orderId);
        if (finalizeOrder) {
            if (index >= 0) {
                recentOrders.splice(index, 1);
            }
        } else {
            if (index == -1) {
                recentOrders.unshift({
                    id: orderId,
                    no: no,
                    total: total / 100,
                    type: order_type,
                    details: this._getOrderTypeDetailsText(orderData),
                });
            }
        }
    }

    static _getOrderTypeDetailsText(orderData) {
        const { order_type, order_details } = orderData;
        if (order_type == 'table') {
            return `#${order_details.table}`;
        } else {
            const { first_name, last_name, phone } = order_details;
            const fullname = first_name + ' ' + (last_name || '');
            const phone_f = Utils.formatPhoneNumber(phone);
            return `${fullname}\n${phone_f}`;
        }
    }

    static setCardsBalances(cards: any) {
        const state = this.context.state;
        if (typeof cards.prepaid == 'number') {
            state.prepaidCard.balance = cards.prepaid;
        }
        if (typeof cards.loyalty == 'number') {
            state.loyaltyCard.balance = cards.loyalty;
        }
    }

    static resetStats() {
        const stats = this.context.state.stats;
        stats.cw = 0;
        stats.pp = 0;
        stats.rpp = 0;
        stats.dt = 0;
        stats.cs = 0;
        stats.cc = 0;
        stats.cxc = 0;
        stats.cxv = 0;
        stats.day = time.today();
    }

    static updateStats(newStats: any, substract?: boolean) {
        const dir = substract ? -1 : 1;
        const stats = this.context.state.stats;
        if (stats.day == newStats.day) {
            stats.cw += newStats.cw * dir;
            stats.pp += newStats.pp * dir;
            stats.rpp += newStats.rpp * dir;
            stats.dt += newStats.dt * dir;
            stats.cs += newStats.cs * dir; // cs => Cash
            stats.cc += newStats.cc * dir; // cc => Credit Card
            stats.cxc += newStats.cxc * dir; // cxc => Canceled orders count
            stats.cxv += newStats.cxv * dir; // cxv => Canceled orders value
        }
    }

    static markAsPaid() {
        this.context.dispatch('markAsPaid');
        // @ts-ignore
        MxHelper.payment({ state: 'posting' });
        this.postOrder().then((orderData) => {
            this.markAsFinished();
            this.printReceipt(null, orderData.no);
            // @ts-ignore
            MxHelper.payment({ state: 'success' });
        }).catch(error => {
            this.resetStatus();
            // @ts-ignore
            MxHelper.payment({ state: 'fail', error });
        });
    }
    static markAsFinished() {
        this.context.dispatch('markAsFinished');
    }

    static setFreeOrderReason(reason: string) {
        this.context.state.freeOrderReason = reason;
    }

    static setInvoiceData(payload: any) {
        this.context.state.invoiceData.clientName = payload.clientName || '';
    }

    // ==================================

    static async printReceiptInAllPrinters(receipt) {
        const printers = Printers.list;
        const posPrinters = printers.filter(p => p.used_for == 'pos');
        const kitchenPrinters = printers.filter(p => p.used_for == 'kitchen');
        const barPrinters = printers.filter(p => p.used_for == 'bar');
        if(window.printToConsole){
            await Receipt.print(receipt);
        }
        for (let printer of posPrinters) {
            Printers.use(printer);
            await Receipt.print(receipt);
        }
        for (let printer of kitchenPrinters) {
            Printers.use(printer);
            await Receipt.printKitchen(receipt);
        }
        for (let printer of barPrinters) {
            Printers.use(printer);
            await Receipt.printBar(receipt);
        }
    }

    static printReceipt(_state?: any, orderNo?: string) {
        console.log('Printing receipt');
        const state = _state || this.context.state;
        const order_id = state.nextOrderId - 1;
        // axios.post(_url('setReceiptFlag'), {order_id}).catch(() => {});
        const receipt = {
            id: order_id,
            no: orderNo,
            order_type: state.pos.orderType,
            order_details: state.pos.orderDetails,
            date_added: state.lastOrderDate,
            cashier: state.user,
            client: state.client,
            products: state.pos.items,
            counts: state.pos.itemsCount,
            totals: state.pos.values,
            pay_method: state.pos.pay_method,
            payment: state.payment,
            loyaltyCard: state.loyaltyCard,
            prepaidCard: state.prepaidCard,
            taxes: state.taxes,
        };
        this.printReceiptInAllPrinters(receipt);
    }

    static reprintReceipt() {
        this.printReceipt(this.prevState);
    }

    static backupState() {
        const state = this.context.state;
        const _state = {
            nextOrderId: state.nextOrderId,
            lastOrderDate: state.lastOrderDate,
            user: state.user,
            client: state.client,
            pos: state.pos,
            payment: state.payment,
            loyaltyCard: state.loyaltyCard,
            prepaidCard: state.prepaidCard,
            taxes: state.taxes,
        };
        this.prevState = JSON.parse(JSON.stringify(_state));
    }

    static registerToReset(obj: any) {
        this.objectsToReset.push(obj);
    }

    static resetObjects() {
        for (let i = 0; i < this.objectsToReset.length; i++) {
            const obj = this.objectsToReset[i];
            if (typeof obj.reset != 'undefined') {
                obj.reset();
            }
        }
    }

    static switchMode(demo: boolean) {
        config.demoMode = demo;
        this.context.state.demoMode = demo;
    }


    // ---------------------------------

    static updateTime() {
        this.context.state.currentTime = extUtils.getCurrentTime();
        if (this.context.state.currentTime == '00:00') {
            this.resetStats();
        }
    }

    // ---------------------------------

    private static getStats(items: any[], itemsCount: any, paym, total) {
        const washesCats = [1, 2, 6, 7];
        const stats = {
            cw: 0,
            pp: 0,
            rpp: 0,
            dt: 0,
            cs: paym == 'cash' ? total : 0,
            cc: paym == 'card' ? total : 0
        };
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const c = itemsCount[item.id];
            if (item.id == consts.newPrepaidCardItemId) {
                stats.pp += c;
            } else if (item.id == consts.reloadPrepaidCardItemId) {
                stats.rpp += c;
            } else if (item.category_id == 3) {
                stats.dt += c;
            } else if (washesCats.includes(item.category_id)) {
                stats.cw += c;
            }
        }
        return stats;
    }

    public static setExactPaid() {
        // @ts-ignore
        MxHelper.setExactPaid();
    }
}