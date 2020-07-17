<template>
    <div class="ui vertical segments">
        <div class="ui segment">
            <h2>Receipt informations</h2>
            <hr>
            <LabeledInput class="input" label="VAT NUMBER" v-model="my_vat_number" :disabled="loading"/> <br>
        </div>
        <div class="ui segment">
            <h2>POS</h2> <hr>
            <LabeledInput class="input" label="NUMBER OF TABLES" v-model="my_tables_count" type='number' :disabled="loading"/> <br>
            <br>
            <div class="ui labeled input">
                <label class="ui large label">USED ORDER TYPES</label>
                <div class="input checks-parent">
                    <sui-checkbox v-model="my_order_types.table" label="Table Order" />
                    <sui-checkbox v-model="my_order_types.delivery" label="Delivery Order" />
                    <sui-checkbox v-model="my_order_types.collection" label="Collection Order" />
                </div>
            </div>
        </div>
        <div class="ui segment">
            <sui-button class="save-btn" icon="save" color="blue" :loading="loading" @click="saveClick">Save all</sui-button>
        </div>
    </div>
</template>

<script lang="ts">
// @ts-nocheck
import Vue from 'vue';
import Component from 'vue-class-component';
import DM from '@/prs/dm';
import {mapState} from 'vuex';
import Message from '@/ccs/Message';
import LabeledInput from '../Elts/inputs/LabeledInput.vue';

@Component({
    components: {
        LabeledInput,
    },
    computed: mapState(['vat_number', 'tables_count', 'order_types']),
    watch: {
        my_tables_count(){
            this.$nextTick().then(() => {
                if(this.my_tables_count < 1){
                    this.my_tables_count = 1;
                }else if(this.my_tables_count > 250){
                    this.my_tables_count = 250;
                }
            })
        }
    }
})
export default class SettingTab extends Vue{
    private my_vat_number: string = '';
    private my_tables_count: number = 0;
    private my_order_types: any = {};

    private loading: boolean = false;
    private successText: boolean = false;

    saveClick(){
        if(this.validateForm()){
            this.loading = true;
            this.save();
        }
    }

    validateForm(){
        const { table, delivery, collection } = this.my_order_types;
        const isValid = table || delivery || collection;
        if(!isValid){
            info('Please select at least one order type.').then(e => e.hide());
        }
        return isValid;
    }

    save(){
        DM.editSettings({
            vat_number: this.my_vat_number,
            tables_count: this.my_tables_count,
            order_types: this.my_order_types,
        }).then(() => {
            this.showSuccessText();
        }).catch(err => {
            Message.info('We could not complete the current action');
        }).finally(() => this.loading = false);
    }

    loadValues(){
        this.my_vat_number = this.vat_number;
        this.my_tables_count = this.tables_count;
        this.my_order_types = Object.clone(this.order_types);
    }

    showSuccessText(){
        this.$toastr.i('Changes were saved!')
    }

    created(){
        this.loadValues();
    }
}
</script>

<style lang="scss" scoped>
@import '@/scss/vars.scss';
.segment{
    text-align: left;
}
h2{
    text-align: left;
}
.input{
    margin-top: .5rem !important;
}
.save-btn{
    margin-top: .5rem;
    width: 10rem;
    margin-left: 0.3rem;
}
.success-text{
    color: $green;
    font-style: italic;
    font-size: 1.3rem;
    margin-left: 0.5rem;
}
.checks-parent .checkbox{
    margin-left: 1rem;
}
</style>
