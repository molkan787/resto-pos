<template>
    <Modal v-model="open" title="Setup Printers" :loading="loading" :dialog="dialog" >

        <!-- <Switcher v-model="type" leftText="USB" rightText="Network" class="typeSelector" /> -->
        <sui-table celled striped>
            <sui-table-header>
                <sui-table-row class="throw">
                    <sui-table-headerCell>Name/IP</sui-table-headerCell>
                    <sui-table-headerCell>Used for</sui-table-headerCell>
                    <!-- <sui-table-headerCell> </sui-table-headerCell> -->
                </sui-table-row>
            </sui-table-header>

            <sui-table-body>

                <sui-table-row class="trow" v-for="(printer, index) in printrers" :key="index">
                    <sui-table-cell class="mycell">
                        {{ printer.name }}
                    </sui-table-cell>
                    <sui-table-cell class="used-for-cell mycell">
                        {{ printer.used_for }}
                        <i @click="removePrinter(printer)" title="Remove this printer" class="close icon"></i>
                    </sui-table-cell>
                    
                </sui-table-row>

                <sui-table-row v-if="printrers.length == 0">
                    <sui-table-cell colspan="2">
                        <span class="empty-text">
                            No printers added yet.
                        </span>
                    </sui-table-cell>
                </sui-table-row>    

            </sui-table-body>
        </sui-table>
        <div class="buttons-group">
            <button @click="addPrinterClick('pos')" class="ui button">Add POS Printer</button>
            <button @click="addPrinterClick('kitchen')" class="ui button">Add Kitchen Printer</button>
            <button @click="addPrinterClick('bar')" class="ui button">Add Bar Printer</button>
        </div>
        <template v-slot:buttons>
            <button class="ui button" @click="closeClick">CLOSE</button>
        </template>
    </Modal>
</template>

<script>
import Printers from '@/prs/printers';
import Modal from '../Elts/Modal.vue';
import Switcher from '../pre/Switcher.vue';
import MxHelper from '@/prs/MxHelper';
import ModalDialog from '@/ccs/ModalDialog';

export default {
    components: {
        Modal,
        Switcher,
    },
    data: () => ({
        open: false,
        loading: false,
        dialog: new ModalDialog(),
        resolve: null,
        reject: null,

        printrers: Printers.list,
    }),

    methods: {
        closeClick(){
            this.open = false;
            this.resolve();
        },
        async addPrinterClick(used_for){
            const config = await MxHelper.selectPrinter();
            if(config){
                const { printerInterface, arg } = config;
                const printer = {
                    printerInterface,
                    name: arg,
                    used_for,
                }
                Printers.addPrinter(printer);
            }
        },
        removePrinter(printer){
            this.dialog.show(`Remove printer "${printer.name}" ?`, 2).then(answer => {
                if(answer == 'OK'){
                    Printers.removePrinter(printer);
                }
            })
        },

        handle(){
            return new Promise((resolve, reject) => {
                this.resolve = resolve;
                this.reject = reject;
                this.open = true;
            });
        }
    },

    mounted(){
        MxHelper.registerFunction('setupPrinters', () => this.handle());
        // this.handle();
    }
}
</script>

<style lang="scss" scoped>
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
.mycell{
    font-size: 18px;
}
.used-for-cell{
    text-transform: uppercase;
    i{
        float: right;
        cursor: pointer;
    }
}
.buttons-group{
    display: flex;
    justify-content: space-between;
    button{
        width: 48%;
        text-transform: uppercase;
    }
}
.empty-text{
    display: inline-block;
    width: 100%;
    text-align: center;
    color: #888;
    font-size: 20px;
}
</style>