<template>
    <div>
        <h3 class="vm-normal">
            <sui-icon name="book" />
            Order #: {{ pos.orderNo || '---' }}
            <!-- <span class="lbl clnl" :class="!loyaltyCard.id ? 'low-imp' : ''"><span>LOY BAL: </span>
                <template v-if="loyaltyCard.id">
                    {{ loyaltyCard.balance | price_m }}
                </template>
                <template v-else>---</template>
            </span> -->
            <sui-label color="blue" icon="info circle" v-if="client.want_receipt" class="lbl receipt">Prefer receipt</sui-label>
        </h3>
        <h3 class="vm-normal">
            <sui-icon name="user" />
            {{ clientName }}
        </h3>
        <OrderType />
        <hr>
        <ClientHistory v-if="areaAView == 'history'" />
        <OrderSummary v-else />
    </div>
</template>

<script lang="ts">
// @ts-nocheck
import Vue from 'vue';
import Component from 'vue-class-component';
import OrderSummary from './OrderSummary.vue';
import ClientHistory from './ClientHistory.vue';
import { mapState } from 'vuex';
import Comu from '@/prs/comu';
import MxHelper from '@/prs/MxHelper';
import OrderType from './OrderType';

@Component({
    components: {
        OrderSummary,
        ClientHistory,
        OrderType,
    },
    computed: {
        ...mapState(['client', 'areaAView', 'loyaltyCard', 'prepaidCard', 'pos']),
        clientName: function () {
            const { orderType, orderDetails } = this.pos;
            if(orderType == 'table'){
                return orderDetails.table ? `Table #${orderDetails.table}` : 'Eat In';
            }else{
                return (orderDetails.first_name + (' ' + orderDetails.last_name || '')).trim() || '---';
            }
        }
    },
})
export default class AreaA extends Vue{

    private orderId: number = 0;

    private orderTypeClick(){
        MxHelper.editOrderType()
    }

}
</script>


<style lang="scss" scoped>
@import '@/scss/vars.scss';
.order-type-btn{
    height: 4rem;
    position: absolute;
    top: 0.5rem;
    right: 0.8rem;
    text-transform: capitalize;
}
div{
    text-align: left;
    height: 100%;
}
.lbl{
    float: right !important;
    span{
        opacity: 0.7;
    }
    &.receipt{
        margin-right: 1rem;
        margin-bottom: -20rem;
        margin-top: -0.2rem;
    }
}
.low-imp{
    opacity: 0.5;
}
.clnl{
    padding: 0 2px;
    border-radius: 7px;
    transition: background 0.2s;
    &.active{
        background-color: lighten($green, 0.4);
    }
}
.order-type{
    display: inline-block;
    height: 47px;
    white-space: nowrap;
    position: absolute;
    top: 10px;
    right: 15px;
}
</style>

