<template>
    <sui-button class="root" @click="rootClick" :class="count > 0 ? 'blue' : 'greyligth'" >
        <div class="text">
            <span>{{ item.name }}</span>
        </div>
        <div class="count" v-if="count > 0">
            <template v-if="item.product_type == 1">
                <button @click="minusClick" class="ctrl" cancel-click="1">
                    <i class="minus icon" cancel-click="1"></i>
                </button>
                <button class="ctrl" disabled>{{ count }}</button>
                <button @click="plusClick" class="ctrl">
                    <i class="plus icon"></i>
                </button>
            </template>
            <template v-else-if="item.product_type == 2">
                <button class="ctrl price" disabled>
                    <i v-if="item.addTaxes" class="balance scale icon"></i>
                    {{ item.price | price }}
                </button>
                <button @click="getPrice" class="ctrl edit">
                    <i class="edit icon"></i>
                </button>
            </template>
        </div>

    </sui-button>
</template>

<script lang="ts">
// @ts-nocheck
import Vue from 'vue';
// import Component from 'vue-class-component';
import {mapActions, mapState} from 'vuex';
import { Prop, Component } from 'vue-property-decorator';
import MxHelper from '@/prs/MxHelper';

@Component({
    computed: {
        ...mapState(['pos']),
        count(){
            return this.pos.itemsCount[this.item.id];
        }
    },
    methods: mapActions(['incItemCount', 'decItemCount', 'setCustomPriceItem'])
})
export default class Item extends Vue{

    @Prop({default: {}}) item!: any;

    rootClick(e: any){
        if(this.count > 0) return;
        if(e && e.srcElement && e.srcElement.getAttribute('cancel-click')) return;
        if(this.item.product_type == 1){
            // @ts-ignore
            this.incItemCount(this.item.id);
            this.updateCount();
        }else{
            this.getPrice();
        }
    }

    // For type 2
    getPrice(){
        MxHelper.getCustomValue({
            title: 'Set Price for "' + this.item.name + '"',
            value: this.item.price,
            taxes: true,
            taxesIncluded: this.item.addTaxes ? false : true,
        }).then((response: any) => {
            const value = response.value;
            // @ts-ignore
            this.setCustomPriceItem({
                taxesIncluded: response.taxesIncluded,
                itemId: this.item.id,
                price: value,
            });
            this.updateCount();
        }).catch(() => {});
    }
    // =============

    // For type 1
    minusClick(){
        // @ts-ignore
        this.decItemCount(this.item.id);
    }

    plusClick(){
        this.incItemCount(this.item.id);
    }

    updateCount(resetTimer?: boolean){
        // this.count = this.pos.itemsCount[this.item.id];
        if(resetTimer || typeof resetTimer == 'undefined'){
            this.resetTimer();
        }
    }
    // =============

    resetTimer(){
        this.$emit('resetTimer');
    }

}
</script>

<style lang="scss" scoped>
@import '@/scss/vars.scss';
button.root{
    position: relative;
    display: inline-block;
    width: 100%;
    height: 100%;
    min-height: 6rem;
    padding: 0;
    margin: 0;
    font-size: 1.2rem;
    float: left;
    
    &.blue{
        div.text span{
            padding-bottom: calc(3rem + 5px);
        }
    }
}
div.text{
    display: table;
    width: 100%;
    text-align: center;
    span{
        display: table-cell;
        vertical-align: middle;
        padding: 5px 0;
        width: 100%;
    }
}
div.count{
    position: absolute;
    top: calc(100% - 3rem);
    height: 3rem;
    width: 100%;
    text-align: center;
    button.ctrl{
        width: calc(100% / 3);
        height: 3rem;
        color: white;
        font-weight: bold;
        border: none;
        background-color: lighten($blue, 10);
        outline: none;
        &:active{
            background-color: darken($blue, 20);
        }
        &:nth-child(1){
            float: left;
            border-bottom-left-radius: 0.3rem;
        }
        &:nth-child(3){
            float: right;
            border-bottom-right-radius: 0.3rem;
        }
        &.price{
            width: calc(100% / 3 * 2);
        }
        &.edit{
            border-bottom-right-radius: 0.3rem;
        }
    }
}
</style>
