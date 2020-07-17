<template>
    <Modal v-model="open" title="Connect Printer" :loading="loading" :dialog="dialog" >

        <Switcher v-model="type" leftText="USB" rightText="Network" class="typeSelector" />
        <template v-if="type == 1">
            <sui-dropdown v-model="arg" :options="availableUsbPrinters" selection fluid :placeholder="'Select Printer'" />
        </template>
        <template v-else>
            <sui-input v-model="arg" placeholder="IP Address (Ex: 192.168.1.1)" autofocus/>
        </template>

        <template v-slot:buttons>
            <button class="ui button" @click="cancel">CANCEL</button>
            <button class="ui green button" @click="validate">CONNECT</button>
        </template>
    </Modal>
</template>

<script>
import Printers from '@/prs/printers';
import Printer from '../../drivers/printer';
import Modal from '../Elts/Modal.vue';
import Switcher from '../pre/Switcher.vue';
import MxHelper from '@/prs/MxHelper';
import ModalDialog from '@/ccs/ModalDialog';

export default {
    components: {
        Modal,
        Switcher,
    },
    watch:{
        type(){
            this.arg = null;
        }
    },
    data: () => ({
        open: false,
        loading: false,
        dialog: new ModalDialog(),

        type: 1,
        arg: null,
        availableUsbPrinters: Printers.getAvailableUsbPrinters()
                                .map(({name}) => ({value: name, text: name})),

        resolve: null,
        reject: null,
    }),

    methods: {
        cancel(){
            this.open = false;
            this.resolve(null);
        },
        validate(){
            if(this.type == 2){
                if(this.arg.length < 11){
                    this.dialog.show('Please enter a valid IP address');
                    return;
                }
                this.connectPrinter(`tcp://${this.arg}`)
            }else{
                if(this.arg.length < 2){
                    this.dialog.show('Please enter a valid Printer name');
                    return;
                }
                this.connectPrinter(`printer:${this.arg}`)
            }
        },
        getInterface(){
            const protocol = this.type == 2 ? 'tcp://' : 'printer:';
            return protocol + this.arg;
        },
        async connectPrinter(printerInterface){
            this.loading = true;
            const connected = await Printer.test(printerInterface);
            if(connected){
                await this.dialog.show('Printer successfully connected!');
                this.open = false;
                this.resolve({
                    printerInterface: this.getInterface(),
                    type: this.type,
                    arg: this.arg,
                });
            }else{
                await this.dialog.show('Failed to connect printer.');
            }
            this.loading = false;
        },
        handle(){
            return new Promise((resolve, reject) => {
                this.resolve = resolve;
                this.reject = reject;
                this.type = 1;
                this.arg = null;
                this.open = true;
            });
        }
    },

    mounted(){
        MxHelper.registerFunction('selectPrinter', () => this.handle());
        // this.handle();
        // this.availableUsbPrinters.unshift({
        //     value: '',
        //     text: '-- Select Printer --'
        // })
    }
}
</script>

<style scoped>
.input{
    width: 100%;
}
.input > input{
    font-size: 20px !important;
}
.typeSelector{
    width: 100%;
    margin-bottom: 20px;
}
</style>