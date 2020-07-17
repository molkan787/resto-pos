<template>
    <div class="m-el">
        <sui-segment attached class="items">
            <OrderItem v-for="item in pos.items" :key="item.id" :text="item.name"
             :amount="item.price" :count="pos.itemsCount[item.id]" :isFree="item.isFree"
             :product_id="item.id" @giftClick="giftClick(item)"/>
            <div v-if="pos.items.length == 0" class="empty-text">No items added</div>
        </sui-segment>
        <Totals class="totals" />
    </div>
</template>

<script lang="ts">
// @ts-nocheck
import Vue from 'vue';
import {mapState, mapActions} from 'vuex';
import Component from 'vue-class-component';
import OrderItem from './OrderItem.vue';
import Totals from './Totals.vue';
import Things from '@/prs/things.ts';
import ProductsFactory from '@/prs/productsFactory.ts';

@Component({
    components:{
        OrderItem,
        Totals,
    },
    computed: {
        ...mapState(['pos'])
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
