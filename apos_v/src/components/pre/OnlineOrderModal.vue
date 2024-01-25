<template>
    <Modal v-model="isOpen" :title="title" :dialog="dialog" size="large">

        <sui-segments horizontal>

            <sui-segment>
                <div class="ui form">
                    <h4 class="low-importance">Products</h4>
                    <sui-table celled striped>
                        <sui-table-header>
                            <sui-table-row>
                                <sui-table-headerCell>Name</sui-table-headerCell>
                                <sui-table-headerCell collapsing text-align="right">Quantity</sui-table-headerCell>
                                <sui-table-headerCell collapsing>Note</sui-table-headerCell>
                            </sui-table-row>
                        </sui-table-header>
                        <sui-table-body>
                            <sui-table-row v-for="p in order.products" :key="p.id">
                                <sui-table-cell>
                                    {{  itemText(p) }}
                                </sui-table-cell>
                                <sui-table-cell collapsing text-align="right">
                                    {{ p.pid == 'discount' ? '-' : p.quantity }}
                                </sui-table-cell>
                                <sui-table-cell collapsing>{{ p.note || '---' }}</sui-table-cell>
                            </sui-table-row>
                        </sui-table-body>
                    </sui-table>
                    <sui-table celled striped>
                        <sui-table-header>
                            <sui-table-row>
                                <sui-table-headerCell text-align="right">Products total</sui-table-headerCell>
                                <sui-table-headerCell collapsing text-align="right">{{ order.total | price }}</sui-table-headerCell>
                            </sui-table-row>
                            <sui-table-row v-if="order.type == OrderType.Delivery">
                                <sui-table-headerCell text-align="right">Delivery</sui-table-headerCell>
                                <sui-table-headerCell collapsing text-align="right">{{ attrs.delivery_cost | price }}</sui-table-headerCell>
                            </sui-table-row>
                            <sui-table-row>
                                <sui-table-headerCell text-align="right">Total</sui-table-headerCell>
                                <sui-table-headerCell collapsing text-align="right">{{ order.total | price }}</sui-table-headerCell>
                            </sui-table-row>
                        </sui-table-header>
                        <sui-table-body>
                        </sui-table-body>
                    </sui-table>
                </div>
            </sui-segment>

            <sui-segment>
                <div class="ui form">
                    <h4 class="low-importance">Customer</h4>
                    <div class="inline fields">
                        <div class="eight wide field">
                            <sui-input v-model="order.owner.fullname" placeholder="Fullname" icon="user" readonly/>
                        </div>
                        <div class="eight wide field">
                            <sui-input v-model="order.owner.email" placeholder="Email" icon="at" readonly/>
                        </div>
                    </div>
                    <h4><span class="low-importance">Order type:</span> {{ order.type | capitalize }}</h4>
                    <template v-if="order.type == OrderType.Delivery">
                        <h4 class="low-importance">Delivery Address</h4>
                        <div class="inline fields">
                            <div class="eight wide field">
                                <sui-input v-model="delAddr.line1" placeholder="Line 1" readonly/>
                            </div>
                            <div class="eight wide field">
                                <sui-input v-model="delAddr.postcode" placeholder="Postcode" readonly/>
                            </div>
                        </div>
                        <div class="inline fields">
                            <div class="eight wide field">
                                <sui-input v-model="delAddr.line2" placeholder="Line 2" readonly/>
                            </div>
                            <div class="eight wide field">
                                <sui-input v-model="delAddr.city" placeholder="City" readonly/>
                            </div>
                        </div>
                    </template>
                    <template v-if="preorder">
                        <h4 class="low-importance">Preorder</h4>
                        <h5 style="margin: 0.5rem 0"><span class="low-importance">Date:</span> {{ preorderDate }}</h5>
                        <h5 style="margin: 0.5rem 0"><span class="low-importance">Time:</span> {{ preorderTime }}</h5>
                    </template>
                    <div>
                        <h4 class="low-importance">Note:</h4>
                        <textarea readonly cols="30" rows="2" placeholder="(empty)">{{ order.note }}</textarea>
                    </div>
                </div>
            </sui-segment>

        </sui-segments>

        <template v-slot:buttons>
            <button class="ui button" @click="close" style="float: left">CLOSE</button>
            <sui-button :loading="loading == 'decline'" :disabled="!!loading" class="ui button" @click="decline">DECLINE</sui-button>
            <div class="accept-settings">
                <sui-dropdown
                    placeholder="Ready time"
                    selection
                    :options="readyTimeOptions"
                    v-model="readyTime"
                />
            </div>
            <sui-button :loading="loading == 'accept'" :disabled="!!loading" class="ui green button" @click="accept">ACCEPT</sui-button>
        </template>
    </Modal>
</template>

<script>
// @ts-nocheck
import Modal from '../Elts/Modal.vue';
import ModalDialog from '@/ccs/ModalDialog';
import Comu from '@/prs/comu';
import { MurewActions } from 'murew-core/dist/enums';
import { OrderType } from 'murew-core/dist/types';
import { Howl } from 'howler';
const { murew, onlineOrdersInbox } = Comu.services.instances;
export default {
    components: {
        Modal,
    },
    data: () => ({
        isOpen: false,
        loading: false,
        dialog: new ModalDialog(),
        order: { owner: {}, attrs: {} },
        readyTime: 45,
        OrderType: OrderType,
        readyTimeOptions: [
            { text: '30 Min', value: 30 },
            { text: '45 Min', value: 45 },
            { text: '60 Min', value: 60 },
            { text: '1 Hour 15 Min', value: 75 },
            { text: '1 Hour 30 Min', value: 90 },
        ],
        beepSound: new Howl({
            src: [require('@/assets/audio/mixkit-alarm-digital-clock-beep-989.wav')],
            loop: true
        })
    }),
    computed: {
        title(){
            return `New online order : ${this.order.no}`
        },
        attrs(){
            return this.order.attrs;
        },
        delAddr(){
            return this.order.delivery_address || {};
        },
        preorder(){
            return this.order.preorder;
        },
        preorderDate(){
            return new Date(this.preorder.date).toLocaleDateString();
        },
        preorderTime(){
            return this.preorder.time.split(':').slice(0, 2).join(':');
        },
    },
    methods: {
        close(){
            this.stopSound();
            this.isOpen = false;
            this.$emit('closed');
        },
        stopSound(){
            try {
                this.beepSound.pause();
            } catch (error) {
                console.error(error);
            }
        },
        decline(){
            this.stopSound();
            this.loading = 'decline';
            murew.declineOrder(this.order.id);
        },
        accept(){
            this.stopSound();
            this.loading = 'accept';
            murew.acceptOrder(this.order.id, this.readyTime);
        },
        handleNewOrder(order){
            this.order = order;
            this.loading = false;
            this.isOpen = true;
            this.beepSound.play();
        },
        async handleOrderStatusChanged(data){
            const { id, status } = data;
            if(id == this.order.id){
                const order = this.order;
                if(status == 'accepted'){
                    try {
                        await this.submitOrder(order);
                        await this.dialog.show('Order successfully accepted!');
                    } catch (error) {
                        await this.dialog.show('An error occured when submiting the order to local database.');
                    }
                }else if(status == 'declined'){
                    await this.dialog.show('Order declined.');
                }
                this.close();
            }
        },
        async submitOrder(order){
            const orderData = await Comu.postOnlineOrder(order);
            await Comu.printOrderReceipt(orderData);
        },

        itemText(p){
            return p.pid == 'discount' ? `${p.name} (${this.$options.filters.price(p.unit_price)})` : p.name;
        }
    },

    created(){
        // murew.on(MurewActions.NewOrder, order => this.handleNewOrder(order));
        murew.on(MurewActions.OrderStatusChanged, data => this.handleOrderStatusChanged(data));
        onlineOrdersInbox.setUiModal(this);
    }
}
</script>

<style lang="scss" scoped>
.input{
    width: 60%;
}
.input > input{
    font-size: 20px !important;
}
.ui.segments, .ui.segment{
    border: none !important;
    box-shadow: none;
}
.ui.segments{
    margin: 0;
}
.ui.segment{
    padding: 0;
}
.ui.segment:first-child{
    padding-right: 1rem;
}
.ui.segment:last-child{
    flex: 2;
    display: flex;
    flex-direction: column;
}
.accept-options{
    display: flex;
    flex-direction: row;
}
.accept-settings{
    display: inline-block;
    margin-left: 2rem;
    .dropdown{
        height: 42.38px;
        transform: translate(0, -3px);
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
    }
}
.modal-buttons.actions{
    button:last-child{
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
        margin: 0;
    }
}
</style>