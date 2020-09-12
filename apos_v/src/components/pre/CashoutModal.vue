<template>
    <Modal v-model="open" title="Cash out" :loading="loading" :dialog="dialog" >

        <sui-input v-model="amount" placeholder="Amount taken out" type="number" autofocus/>

        <template v-slot:buttons>
            <button class="ui button" @click="cancel">CANCEL</button>
            <button class="ui green button" @click="validate">VALIDATE</button>
        </template>
    </Modal>
</template>

<script>
// @ts-nocheck
import Modal from '../Elts/Modal.vue';
import MxHelper from '@/prs/MxHelper';
import ModalDialog from '@/ccs/ModalDialog';
import CashDrawer from '@/prs/cashdrawer';
import Reports from '@/prs/reports';
import DM from '@/prs/dm';
export default {
    components: {
        Modal,
    },
    data: () => ({
        open: false,
        loading: false,
        dialog: new ModalDialog(),

        amount: '',

        resolve: null,
        reject: null,
    }),

    methods: {
        cancel(){
            this.open = false;
            if(this.reject) this.reject('CANCELED');
        },
        validate(){
            const amount = parseFloat(this.amount);
            if(amount > 0 && amount <= 99999){
                this.postCashout(amount);
            }else{
                this.dialog.show('Please enter a valid amount.');
            }
        },
        async postCashout(amount){
            this.loading = true;
            try {
                await DM.recordCashout(amount)
                if(this.resolve) this.resolve();
                this.open = false;
                Reports.loadDailyStats();
            } catch (error) {
                console.error(error);
                this.dialog.show('An error occured, Please try again.');
            }
            this.loading = false;
        },
        handle(){
            return new Promise((resolve, reject) => {
                this.resolve = resolve;
                this.reject = reject;

                this.password = '';
                this.open = true;
                CashDrawer.open();
            });
        }
    },

    mounted(){
        MxHelper.registerFunction('openCashout', () => this.handle());
    }
}
</script>

<style scoped>
.input{
    width: 60%;
}
.input > input{
    font-size: 20px !important;
}
</style>