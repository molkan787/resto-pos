<template>
    <Modal v-model="isOpen" :title="title" :dialog="dialog" size="large">

        <OnlineOrderDetailsViewPanel :order="order" />

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
import OnlineOrderDetailsViewPanel from './OnlineOrderDetailsViewPanel.vue';
import Comu from '@/prs/comu';
import { MurewActions } from 'murew-core/dist/enums';
import { Howl } from 'howler';
const { murew, onlineOrdersInbox } = Comu.services.instances;
export default {
    components: {
        Modal,
        OnlineOrderDetailsViewPanel,
    },
    data: () => ({
        isOpen: false,
        loading: false,
        dialog: new ModalDialog(),
        order: { owner: {}, attrs: {} },
        readyTime: 45,
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