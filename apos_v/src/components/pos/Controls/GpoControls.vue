<template>
    <div class="buttons-group right">
        <sui-button icon="close" @click="buttonClicked(0)"><br>CLEAR POS</sui-button>
        <sui-button icon="unlock" @click="buttonClicked(2)"><br>OPEN CASH DRAWER</sui-button>
        <!-- <sui-button icon="box outline"></sui-button>
        <sui-button icon="box outline"></sui-button> -->
        <sui-button :color="paym == 'cash' ? 'grey' : null" @click="setPayM('cash')"
            icon="money bill alternate"><br>Cash</sui-button>
        <sui-button :color="paym == 'card' ? 'grey' : null" @click="setPayM('card')"
            icon="credit card">Credit/Debit Card</sui-button>

        <sui-button class="submit" @click="submit(false)" :disabled="pos.items.length == 0 || !pos.pay_method" >
            {{ pos.orderId ? 'Update' : 'Submit' }}
            <i class="arrow right icon"></i>
        </sui-button>
        
        <sui-button class="submit" @click="submit(true)" :disabled="pos.items.length == 0 || !pos.pay_method" >
            Finalize
            <i class="arrow right icon"></i>
        </sui-button>
    </div>
</template>

<script>
import {mapState} from 'vuex';
import Comu from '@/prs/comu';
import Message from '@/ccs/Message';
import MxHelper from '@/prs/MxHelper';
import CashDrawer from '@/prs/cashdrawer';

export default {
    computed: {
        ...mapState(['pos', 'app']),
        paym(){
            return this.pos.pay_method;
        },
    },
    methods: {
        submit(finalize){
            const { orderType, orderDetails } = this.pos;
            if(orderType == 'table' && !orderDetails.table){
                this.app.showOrderTypeDetails = true;
                info('Please choose a table').then(e => e.hide());
                return;
            }
            Comu.startSubmission(finalize);
        },
        setPayM(method){
            this.pos.pay_method = method;
            if(method == 'card'){
                this.pos.orderDetails.paid = true;
            }
        },
        buttonClicked(btnIdx){
            if(btnIdx == 0){
                Message.ask('Clear pos?').then(e => {
                    e.hide();
                    e.answer ? Comu.reset() : 0;
                });
            }else if(btnIdx == 1){
                MxHelper.openOptions();
            }else if(btnIdx == 2){
                this.noSale();
            }else if(btnIdx == 3){
                MxHelper.openToolsModal();
            }
        },
        noSale(){
            setTimeout(() => {
                document.getElementById('fssd40').focus()
                document.getElementById('fssd40').click()
            }, 100);
            MxHelper.confirmPassword().then(() =>  CashDrawer.open());
        }
    }
}
</script>

<style lang="scss" scoped>
button{
    font-size: 1.1rem !important;
    padding-left: 0 !important;
    padding-right: 0 !important;
}
.submit.single{
    grid-column: 2 span;
}
</style>