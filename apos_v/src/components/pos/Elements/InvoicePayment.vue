<template>
    <div>
        <hr>
        <h2>
            Invoice / Ari
        </h2>
        <LabeledInput class="company-input" label="Company" v-model="current" :disabled="pos.finished" />
        <div>
            <sui-button  class="btn" :icon="pos.finished ? 'circle check' : ''" size="large"
            :class="pos.finished ? 'green' : ''" @click="finish">
                <span v-if="pos.finished">Finished</span>
                <span v-else>Finish</span>
            </sui-button>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Prop } from 'vue-property-decorator';
import Component from 'vue-class-component';
import { mapState, mapActions } from 'vuex';
import Payments from '@/prs/payments';
import LabeledInput from '../../Elts/inputs/LabeledInput.vue';

@Component({
    components: {
        LabeledInput,
    },
    computed: mapState(['pos', 'companies']),
    methods: mapActions(['setClientId']),
})
export default class InvoicePayment extends Vue{

    private current: any = '';

    finish(){
        // @ts-ignore
        if(this.pos.finished) return;
        if(this.current){
            Payments.requestPayment('invoice_ari', {clientName: this.current});
        }else{
            this.$emit('message', 'Please type Company name');
        }
    }

}
</script>

<style lang="scss" scoped>
@import '@/scss/vars.scss';

hr{
    margin: 2rem 0 1.5rem 0;
}
div{
    text-align: center;
    button{
        width: 60%;
        padding: 1.2rem !important;
    }
}
button.dropdown{
    margin-bottom: 1rem;
    font-size: 1.2rem;
}
.btn{
    width: 24rem;
}
</style>

<style>
.company-input{
    font-size: 1.3rem !important;
    height: 3.5rem !important;
    margin-bottom: 1rem !important;
}
</style>