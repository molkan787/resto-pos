<template>
    <Modal v-model="open" :title="`Order ${order && order.no}`" :dialog="dialog" size="large" class="order-details-modal" >
        
        <OrderDetails v-if="order" :order="order" />

        <template v-slot:buttons>
            <sui-button @click="open = false">CLOSE</sui-button>
        </template>
    </Modal>
</template>

<script>
import Modal from '../Elts/Modal.vue';
import MxHelper from '@/prs/MxHelper';
import ModalDialog from '@/ccs/ModalDialog';
import OrderDetails from '../order/OrderDetails';

export default {
    components: {
        Modal,
        OrderDetails
    },
    data: () => ({
        open: false,
        order: null,
        dialog: new ModalDialog()
    }),
    methods: {
        handleOpen(order){
            this.order = order;
            this.open = true;
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
