<template>
    <div>
        <div class="gift button" @click="$emit('giftClick')" :class="{ immutable }" :title="isFree ? 'Remove free item' : 'Make this item free'">
            <i class="gift icon" :class="{active: isFree}"></i>
        </div>
        <label class="item-name">{{ text }}</label>
        <label v-if="label" class="label">{{ label }}</label>
        <span v-if="isFree">Free</span>
        <span v-else>{{ amount | price }}</span>
        <div class="count">
            <sui-icon @click="minus" name="minus" :class="{ immutable }" />
            <label>{{ count }}</label>
            <sui-icon @click="plus" name="plus" :class="{ immutable }" />
        </div>
    </div>
</template>

<script lang="ts">
// @ts-nocheck
import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import { mapActions } from 'vuex';

@Component({
    methods: mapActions(['incItemCount', 'decItemCount'])
})
export default class OrderItem extends Vue{

    @Prop({default: ''}) text!: string;
    @Prop({default: ''}) label!: string;
    @Prop({default: 0}) amount!: number;
    @Prop({default: 1}) count!: number;
    @Prop({default: false}) isFree!: boolean;
    @Prop({default: false}) immutable!: boolean;
    @Prop({required: true}) product_id: number;

    minus(){
        this.decItemCount(this.product_id);
    }

    plus(){
        this.incItemCount(this.product_id);
    }

}
</script>

<style lang="scss" scoped>
div{
    position: relative;
    width: 100%;
    height: 2rem;
    padding: 0.5rem 0.5rem 1.8rem 0.5rem;
    font-size: 1.3rem;
    border-bottom: 1px solid #ccc;
    background-color: #f5f5f5;
}
span{
    float: right;
}
.item-name{
    width: 50%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    display: inline-block;
}
label.label{
    opacity: 0.8;
    font-size: 0.8em;
}
div.count{
    position: absolute;
    left: 60%;
    top: 0;
    display: inline-block;
    width: fit-content;
    margin-top: -1px;
    border: none;
    background: none;
    label{
        display: inline-block;
        width: 2rem;
        text-align: center;
        font-weight: bold;
    }
    i{
        opacity: 0.8;
        font-size: 0.8em;
    }
}
.gift.button{
    display: inline-block;
    float: left;
    width: 3rem;
    height: 2rem;
    margin-left: -0.5rem;
    margin-top: -0.5rem;
    cursor: pointer;
    .gift.icon{
        opacity: 0.5;
        &.active{
            opacity: 1;
            color: #21BA45;
        }
    }
}
.immutable{
    pointer-events: none;
}
i.immutable{
    opacity: 0 !important;
}
@media only screen and (max-width: 1135px){
    .item-name{
        width: 35%;
    }
    div.count{
        left: 50%;
    }
}
</style>
