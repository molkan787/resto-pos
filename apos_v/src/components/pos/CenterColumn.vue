<template>
    <div class="ui attached vertical segment no-padding">

        <!-- <sui-segment attached class="padding-2">
            <TripleButton :texts="['NEW PREPAID','RELOAD PREPAID','GIFT CERTIFICATE']"
                :colors="['orange', 'black', 'grey']" @click="buttonClicked" />
        </sui-segment> -->

        <sui-segment attached class="row1-block">
            <Products />
        </sui-segment>
        <sui-segment attached class="row2-block controls">
            <!-- <sui-button class="half"
            icon="close" @click="putDiscount('3')"><br>CLEAR POS</sui-button>

            <sui-button class="half"
            icon="setting" @click="putDiscount('5')"><br>OPTIONS</sui-button> -->
            <Switcher class="customerSwitcher" leftText="Eat In" rightText="TakeAway" v-model="orderType" />
            <sui-button icon="close" @click="buttonClicked(0)"><br>CLEAR POS</sui-button>
            <sui-button icon="setting" @click="buttonClicked(1)"><br>OPTIONS</sui-button>
            <sui-button icon="lock" @click="buttonClicked(2)"><br>NO SALE</sui-button>
        </sui-segment>
        
    </div>
</template>

<script lang="ts">
import Comu from '@/prs/comu';
import Vue from 'vue';
import Component from 'vue-class-component';
import TripleButton from '../Elts/TripleButton.vue';
import Products from './Products/Products.vue';
// import Adjustment from './Adjustment/Adjustment.vue';
import Switcher from '../pre/Switcher.vue';
import MxHelper from '@/prs/MxHelper';
import Message from '@/ccs/Message';
import { mapState } from 'vuex';
import { Watch } from 'vue-property-decorator';

@Component({
    components: {
        TripleButton,
        Products,
        // Adjustment,
        Switcher
    },
    computed: mapState(['client', 'pos']),
})
export default class CenterColumn extends Vue{
    private orderType: Number = 1;

    @Watch('orderType')
    watchOrderType(){
        // @ts-ignore
        this.pos.orderType = this.orderType == 1 ? 'eat_in' : 'take_away';
    }

    buttonClicked(btnIdx: number){
        if(btnIdx == 0){
            Comu.reset();
        }else if(btnIdx == 1){
            // @ts-ignore
            MxHelper.openOptions();
        }else if(btnIdx == 2){
            this.noSale();
            // Printer.openCashDrawer();
        }else if(btnIdx == 3){
            // @ts-ignore
            MxHelper.openToolsModal();
        }
    }

    noSale(){
        document.getElementById('fssd40').focus()
        // setTimeout(() => document.getElementById('fssd40').focus(), 100);
        // @ts-ignore
        MxHelper.confirmPassword().then( () =>  Printer.openCashDrawer() );
    }
}
</script>

<style lang="scss" scoped>
.controls{
    button{
        float: left;
        width: 32%;
        height: 6rem;
        margin-bottom: 0.22rem !important;
        font-size: 1.1rem !important;
        line-height: 1.3 !important;
        padding-left: 0 !important;
        padding-right: 0 !important;
        i{
            margin: 0 !important;
        }
    }
}
</style>

<style lang="scss">
.customerSwitcher{
    width: calc(96% + 0.55rem);
    float: left;
    height: 5rem;
    margin-bottom: 1.2rem !important;
    button{
        width: calc(50% - 2px) !important;
        font-size: 1.2rem !important;
        &.positive{
            background-color: rgb(72, 211, 104) !important;
        }
    }
    .or{
        height: 5em !important;
    }
}
</style>