<template>
    <div class="m-el">
        <sui-segment attached class="items">

            <OrderItem v-for="item in pos.items" :key="item.id" :text="item.name"
             :amount="item.price" :count="pos.itemsCount[item.id]" :isFree="item.isFree"
             :product_id="item.id" @giftClick="giftClick(item)" @noteClick="noteClick(item)"
             :minimumCount="getItemMinimumCount(item.id)" :note="pos.itemsNote[item.id]"/>

            <div v-if="pos.items.length == 0" class="empty-text">No items added</div>

            <OrderItem v-for="item in offerItems" :key="'offer-' + item.pid" :text="item.name"
             :amount="0" :count="1" :isFree="true" :immutable="true"
             :product_id="item.pid" :minimumCount="getItemMinimumCount(item.pid)" @noteClick="noteClick(item)"/>

        </sui-segment>
        <Totals class="totals" />
    </div>
</template>

<script lang="ts">
// @ts-nocheck
import Vue from 'vue';
import { mapState, mapActions, mapGetters } from 'vuex';
import Component from 'vue-class-component';
import OrderItem from './OrderItem.vue';
import Totals from './Totals.vue';
import Things from '@/prs/things.ts';
import MxHelper from '@/prs/MxHelper.ts';
import ProductsFactory from '@/prs/productsFactory.ts';

@Component({
    components:{
        OrderItem,
        Totals,
    },
    computed: {
        ...mapState(['pos']),
        ...mapGetters(['offerItems', 'canUserRemoveExistingItems', 'userType'])
    },
    methods: {
        ...mapActions(['loadData', 'setItemCount'])
    }
})
export default class OrderSummary extends Vue{

    private prefix!: {};

    constructor(){
        super();
        this.prefix = Things.prefix;
    }

    giftClick(item){
        if(this.userType >= 5){
            return;
        }
        const count = this.pos.itemsCount[item.id];
        this.setItemCount({
            itemId: item.id,
            count: 0,
        })
        if(!item.isFree){
            const freeItem = ProductsFactory.craftFreeProduct(item);
            this.setItemCount({
                itemId: freeItem.id,
                count,
            })
        }
    }

    async noteClick(item){
        const note = this.pos.itemsNote[item.id] || '';
        try {
            const message = await MxHelper.getReason({
                title: item.name,
                inputLabel: 'Note',
                reason: note,
                force: false,
                showClearButton: true,
            })
            Vue.set(this.pos.itemsNote, item.id, message.trim());
        } catch (error) {
            if(error != 'CANCELED'){
                console.error(error);
            }
        }
    }

    getItemMinimumCount(itemId){
        if(this.canUserRemoveExistingItems){
            return 0;
        }else{
            return this.pos.minimumItemsCount[itemId] || 0;
        }
    }

}
</script>

<style lang="scss" scoped>
@import '@/scss/vars.scss';
div.m-el{
    height: 100%;
    div.segment{
        padding: 0 !important;
        overflow-x: hidden;
        overflow-y: scroll;
        
        &.items{
            height: calc(100% - 16.2rem);
            border-top-left-radius: 3px;
            border-top-right-radius: 3px;
        }
        &.totals{
            // height: $totals-height;
            border-bottom-left-radius: 3px;
            border-bottom-right-radius: 3px;
        }
    }
}
div.empty-text{
    padding-top: 3rem;
    font-style: italic;
    text-align: center;
    font-size: 1.5rem;
    color: #aaa;
}
</style>
