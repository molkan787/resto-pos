<template>
    <Modal v-model="open" title="Order Type" :dialog="dialog" class="my-modal" >
        <sui-button-group class="buttons-group">
            <sui-button @click="setType('table')" :color="type == 'table' ? 'green' : null">Table</sui-button>
            <sui-button @click="setType('delivery')" :color="type == 'delivery' ? 'green' : null">Delivery</sui-button>
            <sui-button @click="setType('collection')" :color="type == 'collection' ? 'green' : null">Collection</sui-button>
        </sui-button-group>
        <sui-form class="my-form">
            <template v-if="type == 'table'">
                <sui-form-field>
                    <label>Table #</label>
                    <input v-model="details.table" placeholder="Table #" >
                </sui-form-field>
            </template>
            <template v-else>
                <ClientInfoForm :data="details" :showAddress="type == 'delivery'" />
            </template>
        </sui-form>

        <template v-slot:buttons>
            <sui-button @click="open = false">Cancel</sui-button>
            <sui-button @click="saveClick" color="green">Ok</sui-button>
        </template>
    </Modal>
</template>

<script lang="ts">
// @ts-nocheck
import Vue from 'vue';
import Modal from '../Elts/Modal.vue';
import Component from 'vue-class-component';
import MxHelper from '@/prs/MxHelper';
import DS from '@/prs/ds';
import { mapState } from 'vuex';
import ModalDialog from '@/ccs/ModalDialog';

@Component({
    components: {
        Modal,
    },
    computed: mapState(['pos'])
})
export default class CategoryModal extends Vue{
    private open: boolean = false;
    private loading: boolean = false;
    private dialog = new ModalDialog();

    private type: string = '';
    private details: any = {};

    private setType(type){
        this.type = type;
    }

    private saveClick(){
        const error = this.validateForm();
        if(error){
            this.dialog.show(error);
        }else{
            this.save();
            this.open = false;
        }
    }

    private save(){
        this.pos.orderType = this.type;
        this.pos.orderDetails = this.details;
    }

    private validateForm(){
        this.trimForm();
        const t = this.type;
        const d = this.details;
        if(t == 'table'){
            if(d.table.length < 1) return 'Please enter Table number.';
        }else if(t == 'delivery'){
            if(d.first_name.length < 2) return 'Please enter customer first name';
            if(d.phone.length != 11) return 'Please enter a valid phone number';
            if(d.address_1.length < 3) return 'Please enter a valid address';
            if(d.postcode.length < 3) return 'Please enter a valid postcode';
        }else if(t == 'collection'){
            if(d.first_name.length < 2) return 'Please enter customer first name';
        }
        return null;
    }

    handleOpen(){
        this.type = this.pos.orderType;
        this.details = JSON.parse(JSON.stringify(this.pos.orderDetails));
        this.open = true;
    }

    private trimForm(){
        const d = this.details;
        for(let p in d){
            if(typeof d[p] == 'string') d[p] = d[p].trim();
        }
    }

    // --------------------------------

    created(){
        MxHelper.registerFunction('editOrderType', () => this.handleOpen());
        // setTimeout(() => MxHelper.editOrderType(), 500);
    }
}
</script>

<style lang="scss" scoped>
.my-modal{
    min-width: 550px !important;
}
.buttons-group{
    width: 100%;
    button{
        width: 33%;
        font-size: 1.2rem !important;
    }
}
.my-form{
    padding-top: 2rem;
    height: 17.7rem;
}
label, input, div.dropdown{
    font-size: 1.2rem !important;
}
</style>
