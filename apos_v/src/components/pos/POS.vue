<template>
    <div class="page">
        <Header />
        <CBody />
        <PaymentModal />
        <GiftCertificateModal />
        <ToolsModal />
        <LoyaltyScanModal />
    </div>
</template>

<script lang="ts">
// @ts-nocheck
import { Component, Vue } from 'vue-property-decorator';
import { mapState, mapActions } from 'vuex';
import Header from './Header.vue';
import CBody from './CBody.vue';
import PaymentModal from './Elements/PaymentModal.vue';
import GiftCertificateModal from '../pre/GiftCertificateModal.vue';
import ToolsModal from '../pre/ToolsModal.vue';
import LoyaltyScanModal from '../pre/LoyaltyScanModal.vue';
import CometCallerId from '../../drivers/CometCallerId';

@Component({
    components: {
        Header,
        CBody,
        PaymentModal,
        GiftCertificateModal,
        ToolsModal,
        LoyaltyScanModal,
    },
    computed: mapState({
        app: state => state.app,
        pos: state => state.pos,
    }),
    methods: mapActions(['clearOrderClientDetails'])
})
export default class Home extends Vue {
    private callerId: CometCallerId = new CometCallerId();

    handleGotCall(data){
        this.pos.orderType = 'delivery';
        this.clearOrderClientDetails();
        this.app.showOrderTypeDetails = true;
        this.pos.orderDetails.phone = (data.callingLineNumber || '').trim();
    }

    mounted(){
        console.log('this.callerId', this.callerId)
        const callerId = this.callerId;
        callerId.on('error', err => console.error(err));
        callerId.on('got-call', data => this.handleGotCall(data));
        callerId.start(true);
    }
}
</script>
