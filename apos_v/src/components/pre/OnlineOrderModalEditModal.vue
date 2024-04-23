<template>
    <Modal v-model="isOpen" :title="title" :dialog="dialog" :loading="loading" :contentOnlyDimmer="true" size="large">

        <OnlineOrderDetailsViewPanel :order="order" />

        <hr>
        <sui-button-group class="order-type buttons-group">
            <sui-button class="ot-button" icon="arrow alternate circle down" @click="setStatus('accepted')" :color="status == 'accepted' ? 'green' : null">Accepted</sui-button>
            <sui-button class="ot-button" icon="clock" @click="setStatus('preparing')" :color="status == 'preparing' ? 'green' : null">Preparing</sui-button>
            <sui-button class="ot-button" icon="box" @click="setStatus('ready')" :color="status == 'ready' ? 'green' : null">Ready</sui-button>
            <sui-button class="ot-button" icon="check circle" @click="setStatus('completed')" :color="status == 'completed' ? 'green' : null">Completed</sui-button>
        </sui-button-group>

        <template v-slot:buttons>
            <button class="ui button" @click="close" style="float: left;">CLOSE</button>
            <sui-button :loading="loading == 'update'" :disabled="!!loading" class="ui green button" @click="update">UPDATE</sui-button>
        </template>
    </Modal>
</template>

<script>
// @ts-nocheck
import Modal from '../Elts/Modal.vue';
import ModalDialog from '@/ccs/ModalDialog';
import OnlineOrderDetailsViewPanel from './OnlineOrderDetailsViewPanel.vue';
import Comu from '@/prs/comu';
const { murewSync } = Comu.services.instances;

export default {
    components: {
        Modal,
        OnlineOrderDetailsViewPanel,
    },
    data: () => ({
        isOpen: false,
        loading: true,
        dialog: new ModalDialog(),
        order: { owner: {}, attrs: {} },
        orderNo: '',
        status: 'accepted'
    }),
    computed: {
        title(){
            return `Online order : ${this.orderNo}`
        },
    },
    methods: {
        setStatus(status){
            this.status = status
        },
        close(){
            this.isOpen = false;
            this.$emit('closed');
        },
        update(){
            this.loading = 'update';
            murew.acceptOrder(this.order.id, this.readyTime);
        },
        handleOrder(orderNo){
            this.orderNo = orderNo
            this.loading = true;
            this.isOpen = true;
            this.loadOrderData(orderNo)
        },
        async loadOrderData(orderNo){
            try {
                const order = await murewSync.getOrder(orderNo)
                console.log('online order:', order)
                this.order = order
                this.loading = false
            } catch (error) {
                console.error(error)
                await this.dialog.show('An error occured while loading order data, Please make sure you are connected to the internet.')
                this.close()
            }
        }
    },

    created(){
        window.editOnlineOrder = (orderNo) => this.handleOrder(orderNo)
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
</style>