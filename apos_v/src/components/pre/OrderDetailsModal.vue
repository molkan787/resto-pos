<template>
    <Modal v-model="open" :title="`Order ${order && order.no}`" :dialog="dialog" size="large" class="order-details-modal" >
        
        <OrderDetails v-if="order" :order="order" />

        <template v-slot:buttons>
            <sui-button @click="printReceipt" icon="file alternate" :loading="printBtnLoading">Print Receipt</sui-button>
            <sui-button @click="open = false">CLOSE</sui-button>
        </template>
    </Modal>
</template>

<script>
import Modal from '../Elts/Modal.vue';
import MxHelper from '@/prs/MxHelper';
import ModalDialog from '@/ccs/ModalDialog';
import OrderDetails from '../order/OrderDetails';
import Comu from '@/prs/comu';

export default {
    components: {
        Modal,
        OrderDetails
    },
    data: () => ({
        open: false,
        printBtnLoading: false,
        dialog: new ModalDialog(),

        order: null,
    }),
    methods: {
        handleOpen(order){
            this.order = order;
            this.open = true;
        },
        printReceipt(){
            Comu.printOrderReceipt(this.order, 'pos');
            this.printBtnLoading = true;
            setTimeout(() => this.printBtnLoading = false, 1000);
        }
    },
    created(){
        MxHelper.registerFunction('showOrderDetails', (order) => this.handleOpen(order));
    }
}

</script>

<style lang="scss" scoped>
.order-details-modal{

}
</style>
