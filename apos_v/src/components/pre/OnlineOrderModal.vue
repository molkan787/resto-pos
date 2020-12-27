<template>
    <Modal v-model="isOpen" title="New online order":dialog="dialog" >

        <div class="ui form">
            <h4>Customer</h4>
            <div class="inline fields">
                <div class="eight wide field">
                    <sui-input v-model="order.owner.fullname" placeholder="Fullname" icon="user" readonly/>
                </div>
                <div class="eight wide field">
                    <sui-input v-model="order.owner.email" placeholder="Email" icon="at" readonly/>
                </div>
            </div>
            <h4>Products</h4>
            <sui-table celled striped>
                <sui-table-header>
                    <!-- <sui-table-row>
                        <sui-table-headerCell colspan="3">Products</sui-table-headerCell>
                    </sui-table-row> -->
                    <sui-table-row>
                        <sui-table-headerCell>Name</sui-table-headerCell>
                        <sui-table-headerCell collapsing text-align="right">Quantity</sui-table-headerCell>
                        <sui-table-headerCell collapsing>Note</sui-table-headerCell>
                    </sui-table-row>
                </sui-table-header>
                <sui-table-body>
                    <sui-table-row v-for="p in order.products" :key="p.id">
                        <sui-table-cell>{{ p.name }}</sui-table-cell>
                        <sui-table-cell collapsing text-align="right">{{ p.quantity }}</sui-table-cell>
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
                    <sui-table-row>
                        <sui-table-headerCell text-align="right">Delivery</sui-table-headerCell>
                        <sui-table-headerCell collapsing text-align="right">{{ 0 | price }}</sui-table-headerCell>
                    </sui-table-row>
                    <sui-table-row>
                        <sui-table-headerCell text-align="right">Total</sui-table-headerCell>
                        <sui-table-headerCell collapsing text-align="right">{{ order.total | price }}</sui-table-headerCell>
                    </sui-table-row>
                </sui-table-header>
                <sui-table-body>
                    <!-- <sui-table-row >
                        <sui-table-cell>{{ p.name }}</sui-table-cell>
                        <sui-table-cell collapsing text-align="right">{{ p.quantity }}</sui-table-cell>
                        <sui-table-cell collapsing>{{ p.note || '---' }}</sui-table-cell>
                    </sui-table-row> -->
                </sui-table-body>
            </sui-table>
        </div>

        <template v-slot:buttons>
            <button class="ui button" @click="close" style="float: left">CLOSE</button>
            <button :loading="loading == 'decline'" :disabled="loading" class="ui button" @click="decline">DECLINE</button>
            <button :loading="loading == 'accept'" :disabled="loading" class="ui green button" @click="accept">ACCEPT</button>
        </template>
    </Modal>
</template>

<script>
// @ts-nocheck
import Modal from '../Elts/Modal.vue';
import MxHelper from '@/prs/MxHelper';
import ModalDialog from '@/ccs/ModalDialog';
import CashDrawer from '@/prs/cashdrawer';
import Reports from '@/prs/reports';
import DM from '@/prs/dm';
import Comu from '@/prs/comu';
import { MurewActions } from '@/services/murew';
const { murew } = Comu.services.instances;
export default {
    components: {
        Modal,
    },
    data: () => ({
        isOpen: false,
        loading: false,
        dialog: new ModalDialog(),
        order: { owner: {} }
    }),

    methods: {
        close(){
            this.isOpen = false;
        },
        decline(){
            this.loading = 'decline';
            murew.declineOrder(this.order.id);
        },
        accept(){
            this.loading = 'accept';
            murew.acceptOrder(this.order.id);
        },
        handleNewOrder(order){
            this.order = order;
            this.loading = false;
            this.isOpen = true;
        },
        async handleOrderStatusChanged(data){
            const { id, status } = data;
            if(id == this.order.id){
                const order = this.order;
                this.order = { owner: {} };
                if(status == 'accepted'){
                    try {
                        this.submitOrder(order);
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
        }
    },

    mounted(){
        murew.on(MurewActions.NewOrder, order => this.handleNewOrder(order));
        murew.on(MurewActions.OrderStatusChanged, data => this.handleOrderStatusChanged(data));
    }
}
</script>

<style scoped>
.input{
    width: 60%;
}
.input > input{
    font-size: 20px !important;
}
</style>