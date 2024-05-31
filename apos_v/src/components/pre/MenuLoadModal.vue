<template>
    <Modal v-model="open" title="Load Menu" :loading="loading" :dialog="dialog" size="large" >
        <div class="row">
            <textarea v-model="dataToParse"></textarea>
            <div class="result">
                <h3>Preview</h3>
                <div class="category" v-for="(c, index) in (parsedData || {}).categories || []" :key="index">
                    <h4>{{ c.name }}</h4>
                    <ul>
                        <li v-for="(p, index2) in c.childs" :key="index2">
                            {{  p.name  }}
                            <span style="float: right;">{{ p.price | price }}</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>

        <template v-slot:buttons>
            <sui-button @click="open = false">Cancel</sui-button>
            <sui-button @click="saveClick" color="green">Load</sui-button>
        </template>
    </Modal>
</template>

<script lang="ts">
import Modal from '../Elts/Modal.vue';
import MxHelper from '@/prs/MxHelper';
import DS from '@/prs/ds';
import ModalDialog from '@/ccs/ModalDialog';
import { MenuParser } from '@/Libs/MenuParser';

export default{
    components: {
        Modal,
    },
    data: () => ({
        open: false,
        loading:  false,
        dialog: new ModalDialog,
        dataToParse: '',
        parsedData: <{ categories: [], lonelyProducts: [] } | null>null,
    }),
    watch: {
        dataToParse(){
            try {
                const data = MenuParser.parseFromText(this.dataToParse)
                this.parsedData = data
            } catch (error) {
                this.parsedData = null
                console.error(error)
            }
        }
    },
    methods: {
        saveClick(){
            if(this.validateForm()){
                this.save();
            }
        },
        save(){
            this.loading = true;
            DS.addBulkCategories(this.parsedData.categories).then(() => {
                this.dialog.show('Menu was successfully loaded!').then(() => {
                    this.open = false;
                });
            }).catch(error => {
                this.dialog.show('We could not load data');
            }).finally(() => {
                this.loading = false;
            });
        },
        validateForm(){
            if(this.dataToParse.length > 2){
                return true;
            }else{
                this.dialog.show('Please input data');
            }
            return false;
        }
    },

    created(){
        MxHelper.registerFunction('openMenuLoader', (payload: any) => {
            this.open = true;
        });
    }
}

</script>

<style lang="scss" scoped>
.my-switcher{
    width: 100%;
}
label, input, div.dropdown{
    font-size: 1.2rem !important;
}
.row{
    display: flex;
    flex-direction: row;
    height: 400px;
    & > *{
        flex: 1;
    }
}
.result{
    padding: 0 1rem;
    height: 100%;
    overflow-y: scroll;
    text-wrap: wrap;
}
</style>
