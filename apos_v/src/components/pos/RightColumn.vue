<template>
    <div class="ui attached vertical segment no-padding">

        <sui-segment attached class="top-side no-padding">
            <ProductsSearch v-if="app.showProductsSearch" />
            <OrderTypeDetails v-else-if="app.showOrderTypeDetails" />
            <Products v-if="!app.showProductsSearch" />
        </sui-segment>

        <sui-segment attached class="mid-side">
            <OfferSelection />
        </sui-segment>

        <sui-segment attached class="bottom-side">
            <CoreControls />
            <Payments />
            <GpoControls />

        </sui-segment>
        
    </div>
</template>

<script lang="ts">
// @ts-nocheck
import Vue from 'vue';
import { mapState } from 'vuex';
import Component from 'vue-class-component';
import TripleButton from '../Elts/TripleButton.vue';
import CoreControls from './Controls/CoreControls.vue';
import GpoControls from './Controls/GpoControls.vue';
import Payments from './Payments/Payments.vue';
import PaymentMethods from './PaymentMethods/PaymentMethods.vue';
import Products from './Products/Products.vue';
import OrderTypeDetails from './OrderTypeDetails.vue';
import ProductsSearch from './Products/ProductsSearch.vue';
import OfferSelection from './Controls/OfferSelection';

@Component({
    components: {
        TripleButton,
        Payments,
        PaymentMethods,
        CoreControls,
        GpoControls,
        Products,
        OrderTypeDetails,
        ProductsSearch,
        OfferSelection,
    },
    computed: mapState(['app'])
})
export default class RightColumn extends Vue{
}
</script>

<style lang="scss" scoped>
.segment{
    box-sizing: border-box;
    width: 200% !important;
    padding: 0.5rem;
}
.row1-block{
    z-index: 1;
}
$bot-side-height: 20.3rem;
$mid-side-height: 3rem;
.top-side{
    height: calc(100% - #{$bot-side-height + $mid-side-height});
    overflow: hidden;
}
.mid-side{
    height: $mid-side-height;
}
.bottom-side{
    height: $bot-side-height;
}
.buttons-group{
    float: left;
    display: inline-grid;
    width: 16rem;
    height: calc(100% - 0.2rem * 2);
    grid-template-columns: 50% 50%;
    grid-template-rows: calc(100% / 3) calc(100% / 3) calc(100% / 3);
    row-gap: 0.2rem;
    column-gap: 0;
    &.right{
        float: right;
    }
}
@media only screen and (max-width: 1200px) {
    .bottom-side{
        display: flex;
    }
}
</style>

<style>
.buttons-group button i{
    font-size: 20px !important;
    margin: 0 0 6px 0 !important;
}
</style>

