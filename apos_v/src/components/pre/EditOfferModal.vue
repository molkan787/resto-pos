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
import { OfferGetType } from 'murew-core/dist/interfaces/Offer';

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

    private offerId: number = 0;
    private forceNew: boolean = false;
    private formData: any = null;

    async save(){
        console.log(this.formData)
        if(this.validateForm()){
            this.loading = true;
            try {
                this.prepareFormData();
                console.log(this.formData)
                await DM.editOffer(this.formData);
                await this.dialog.show('Changes were successfully saved!');
                this.cancel(true);
            } catch (error) {
                console.error(error);
                this.dialog.show('An error occured, Please try again');
            }
            this.loading = false;
        }
    }

    cancel(callbackValue?: any){
        this.open = false;
        if(this.callback) this.callback(callbackValue || false);
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
            // @ts-ignore
            this.formData = Object.clone(data);
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
    }

    prepareFormData(){
        ['available_on_delivery',
        'available_on_pickup',
        'available_on_website',
        'available_on_pos',
        'activated_by_promo_code']
        .forEach(p => this.formData[p] = Number(this.formData[p]));
    }
    
    validateForm(){
        const { name, activated_by_promo_code, promo_code, benefits } = this.formData;
        const benefit = benefits[0];
        const benefitError = this.validateBenefitData(benefit);
        if(name.length < 2){
            this.dialog.show('Offer name must be at least 2 characters long');
        }else if(activated_by_promo_code && promo_code.length < 2){
            this.dialog.show('Promo code must be at least 2 characters long');
        }else if(benefitError){
            this.dialog.show(benefitError);
        }else{
            return true;
        }
        
        return false;
    }

    validateBenefitData(benefit){
        const { type, percent_amount, all_items, items, max_items, max_value } = benefit;
        if(type == OfferGetType.PercentDiscount){
            if(typeof percent_amount != 'number'){
                return 'Please specify discount amount in percent';
            }
        }else if(type == OfferGetType.FreeItems){
            if(!all_items && items.length == 0){
                return 'Please add at least one item to the offer benefit';
            }else if(typeof max_items != 'number'){
                return 'Please specify the maximum number of items';
            }else if(typeof max_value != 'number'){
                return 'Please specify the maximum value of selected items';
            }
        }
        return null;
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
        // setTimeout(() => {
        //     this.loadOffer({});
        //     this.open = true;
        // }, 500)
    }

}
</script>
