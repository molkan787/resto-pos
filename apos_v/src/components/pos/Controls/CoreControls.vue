<template>
    <div class="buttons-group">
        <sui-button icon="write" @click="kitchenMessageClick" :color="kitchenMessage ? 'grey' : null" >
            <br>Kitchen Message
        </sui-button>
        <sui-button icon="calendar" @click="bookingsClick" >
            <br>Bookings
        </sui-button>

        <sui-button icon="pound" @click="discountClick(false)" >
            <br>Discount<br>
            <span v-if="customDiscount > 0" class="positive-color">({{ customDiscount | price }})</span>
        </sui-button>
        <sui-button icon="percent" @click="discountClick(true)" >
            <br>Discount<br>
            <span v-if="percentDiscount > 0" class="positive-color">({{ percentDiscount | percent }})</span>
        </sui-button>

        <sui-button icon="plus square" @click="extraChargeClick">
            <br>Extra Charge<br>
            <span v-if="pos.values.extraCharge > 0" class="positive-color">({{ pos.values.extraCharge | price }})</span>
        </sui-button>
        <sui-button icon="money bill alternate" @click="tipsClick">
            <br>Add Tip<br>
            <span v-if="pos.values.tips > 0" class="positive-color">({{ pos.values.tips | price }})</span>
        </sui-button>

    </div>
</template>

<script lang="ts">
// @ts-nocheck
import Vue from 'vue';
import Component from 'vue-class-component';
import { mapActions, mapState } from 'vuex';
import Comu from '@/prs/comu';
import MxHelper from '@/prs/MxHelper';
import Message from '@/ccs/Message';

@Component({
    computed: {
        ...mapState(['pos', 'extraChargeReason', 'discountReason']),
        kitchenMessage(){
            return this.pos.orderDetails.kitchenMessage;
        }
    },
    methods: mapActions(['setDiscount', 'setPercentDiscount', 'setExtraCharge', 'setTips'])
})
export default class Adjustment extends Vue{
    private currentDiscount: any = '';
    private tipAmount: number = 0;
    private customDiscount = 0;
    private percentDiscount = 0;

    async kitchenMessageClick(){
        try {
            const message = await MxHelper.getReason({
                title: 'Kitchen Message',
                inputLabel: 'Message',
                reason: this.kitchenMessage,
                force: false,
                showClearButton: true,
            })
           this.pos.orderDetails.kitchenMessage = message.trim();
        } catch (error) {
            if(error != 'CANCELED'){
                console.error(error);
            }
        }
    }

    bookingsClick(){
        MxHelper.openBookingListModal();
    }

    extraChargeClick(){
        MxHelper.getCustomValue({
            title: 'Extra Charge',
            reason: true,
            reasonTitle: 'For what ?',
            reasonText: this.extraChargeReason,
            value: this.pos.values.extraCharge
        }).then(result => {
            this.setExtraCharge(result);
        }).catch(() => {});
    }

    tipsClick(){
        MxHelper.getCustomValue({
            title: 'Add Tips',
            value: this.pos.values.tips
        }).then(value => {
            this.setTips(value);
        }).catch(() => {});
    }

    discountClick(percent){
        MxHelper.getCustomValue({
            title: percent ? 'Percentage Discount (Food only)' : 'Custom Discount',
            reason: true,
            value: percent ? 0 : this.customDiscount,
            inputType: percent ? 'percent' : 'money',
        }).then((result: any) => {
            this.customDiscount = percent ? 0 : result.value;
            this.percentDiscount = percent ? result.value : 0;
            this.putDiscount(percent ? 'percent' : 'custom', result.reason);
        }).catch(() => {});
    }

    putDiscount(discount: string, reason?: string){
        const prevDiscount = this.currentDiscount;
        const prevCustom = this.customDiscount;
        if(this.currentDiscount == discount && discount != 'custom')
            this.currentDiscount = '';
        else
            this.currentDiscount = discount;

        if(this.currentDiscount == ''){
            this.setDiscount(0);
        }else if(this.currentDiscount == 'percent'){
            this.setPercentDiscount({value: this.percentDiscount, reason, ctype: 1});
        }else if(this.currentDiscount == 'full'){
            MxHelper.getReason({title: 'Reason of full discount'}).then((reason: string) => {
                this.setDiscount({value: this.currentDiscount, reason});
            }).catch((error: any) => {
                this.currentDiscount = prevDiscount;
                this.customDiscount = prevCustom;
            });
        }else if(this.currentDiscount == 'custom'){
            this.setDiscount({value: this.customDiscount, reason});
        }else{
            this.setDiscount(parseInt(this.currentDiscount));
        }

        if(discount == 'custom'){
            if(this.customDiscount <= 0)
                this.currentDiscount = '';
        }else{
            this.customDiscount = 0;
        }
            
    }

    buttonClicked(btnIdx: number){
        if(btnIdx == 0){
            Message.ask('Clear pos?').then(e => {
                e.hide();
                e.answer ? Comu.reset() : 0;
            });
        }else if(btnIdx == 1){
            MxHelper.openOptions();
        }else if(btnIdx == 2){
            // this.noSale();
            // Printer.openCashDrawer();
        }else if(btnIdx == 3){
            MxHelper.openToolsModal();
        }
    }

    reset(){
        this.currentDiscount = '';
        this.customDiscount = 0;
        this.percentDiscount = 0;
    }

    created(){
        Comu.registerToReset(this);
    }
}
</script>

<style lang="scss" scoped>
@import '@/scss/vars.scss';
button{
    font-size: 1.1rem !important;
    padding-left: 0 !important;
    padding-right: 0 !important;
}
@media only screen and (max-width: 1050px) {
    button{
        font-size: 1rem !important;
    }
}
.positive-color{
    color: $green;
}
</style>

