<template>
    <Modal v-model="open" :title="title" :loading="loading" :dialog="dialog" @dialogAnswer="dialogAnswer" >

        <OfferForm v-if="formData" :data="formData" />

        <template v-slot:buttons>
            <button class="ui button" @click="cancel">CANCEL</button>
            <button class="ui green button" @click="save">SAVE</button>
        </template>
    </Modal>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import Modal from '../Elts/Modal.vue';
import MxHelper from '@/prs/MxHelper';
import ModalDialog from '@/ccs/ModalDialog';
import DM from '@/prs/dm';
import OfferForm from './OfferForm.vue';
import utils from '@/prs/utils';

@Component({
    components: {
        Modal,
        OfferForm,
    },
    computed: {
        title(){
            return this.offerId ? `Edit offer id: ${this.offerId}` : 'Create new offer';
        }
    }
})
export default class ClientModal extends Vue{
    private open: boolean = false;
    private loading: boolean = false;
    private dialog = new ModalDialog();

    private payload!: any;
    private callback!: Function;

    private offerId!: any;
    private forceNew: boolean = false;
    private formData: any = null;

    save(){
        // if(this.validateForm()){
        //     this.loading = true;
            
        // }
        console.log(this.formData)
    }

    cancel(){
        this.open = false;
        if(this.callback) this.callback(false);
        setTimeout(() => {
            this.formData = null;
        }, 500)
    }

    loadOffer(payload: any){
        this.payload = payload;
        const id = payload.id;
        this.offerId = id;
        this.setFormData(payload.data);
    }

    setFormData(data: any){
        if(data){
            this.formData = Object.assign({}, data);
            return;
        }
        this.formData = {
            name: '',
            expires: '',
            condition: {
                minimum_order_value: 0,
                minimum_items_count: 0,
            },
            available_on_delivery: 1,
            available_on_pickup: 1,
            available_on_website: 1,
            available_on_pos: 1,
            benefits: [{
                __component: "offer.benefit-percent-discount",
                type: "percent_discount",
                percent_amount: 10,
            }],
            activated_by_promo_code: 0,
            promo_code: '',
        }
        console.log(this.formData)
    }
    
    validateForm(){
        const d = this.formData;
        if(d.phone.length != 11 || d.first_name.length < 2){
            this.dialog.show('Please enter a valid phone number and first name');
        }else{
            return true;
        }
        return false;
    }

    dialogAnswer(){
        if(this.dialog.ref == 'loading_error'){
            this.open = false;
        }
    }

    created(){
        MxHelper.registerFunction('editOffer', (payload: any) => new Promise((resolve, reject) => {
            this.callback = resolve;
            this.loadOffer(payload || {});
            this.open = true;
        }));
        setTimeout(() => {
            this.loadOffer({});
            this.open = true;
        }, 500)
    }

}
</script>
