<template>
    <Modal v-model="open" :title="title" :loading="loading" :dialog="dialog" >
        <sui-form @submit="$event.preventDefault()">
            <sui-form-field>
                <label>Type</label>
                <Switcher v-model="ctype" class="my-switcher" leftText="Food" rightText="Drinks"/>
            </sui-form-field>
            <sui-form-field>
                <label>Name</label>
                <input v-model="categoryName" placeholder="Name" >
            </sui-form-field>
            <sui-form-field>
                <label>Sort No</label>
                <input v-model.number="sort_no" type="number" >
            </sui-form-field>
        </sui-form>

        <template v-slot:buttons>
            <sui-button @click="open = false">Cancel</sui-button>
            <sui-button @click="saveClick" color="green">Save</sui-button>
        </template>
    </Modal>
</template>

<script lang="ts">
// @ts-nocheck
import Vue from 'vue';
import Modal from '../Elts/Modal.vue';
import Switcher from './Switcher.vue';
import Component from 'vue-class-component';
import MxHelper from '@/prs/MxHelper';
import DS from '@/prs/ds';
import ModalDialog from '@/ccs/ModalDialog';

@Component({
    components: {
        Modal,
        Switcher,
    },
    computed: {
        title(){
            const objectName = (this.parentCategory || this.category && this.category.parent_id) ? 'Sub-category' : 'Category';
            if(this.category){
                return `Edit ${objectName}: ${this.category.name.toUpperCase()}`;
            }else{
                return `Add ${objectName}`;
            }
        }
    }
})
export default class CategoryModal extends Vue{
    private open: boolean = false;
    private loading: boolean = false;
    private dialog = new ModalDialog();

    private category: any = null;
    private parentCategory: any = null;
    private categoryName: string = '';
    private ctype: number = 1;
    private sort_no: number = 1;
    private parent_id: number = 0;


    private saveClick(){
        if(this.validateForm()){
            this.save();
        }
    }

    private save(){
        const data = {
            id: this.category ? this.category.id : 'new',
            name: this.categoryName,
            childs_type: 0,
            parent_id: this.parentCategory ? this.parentCategory.id : this.parent_id,
            ctype: this.ctype,
            sort_no: this.sort_no || 0
        };
        this.loading = true;
        DS.editCategory(data).then(() => {
            this.dialog.show('Category was successfully saved!').then(() => {
                this.open = false;
            });
        }).catch(error => {
            this.dialog.show('We could not save changes, You may be offline.');
        }).finally(() => {
            this.loading = false;
        });
    }

    // --------------------------------
    private validateForm(){
        if(this.categoryName.length > 2){
            return true;
        }else{
            this.dialog.show('Please type the category name with at least 2 characters.');
        }
        return false;
    }
    // --------------------------------

    private handle(payload: any){
        const { parent, current } = payload || {};
        if(current){
            this.category = current;
            this.categoryName = current.name;
            this.ctype = current.ctype;
            this.parentCategory = null;
            this.sort_no = current.sort_no;
            this.parent_id = current.parent_id;
        }else{
            this.category = null;
            this.parentCategory = parent;
            this.categoryName = '';
            this.ctype = 1;
            this.sort_no = 0;
            this.parent_id = 0;
        }
    }

    created(){
        MxHelper.registerFunction('editCategory', (payload: any) => {
            this.handle(payload);
            this.open = true;
        });
        // setTimeout(() => MxHelper.editCategory(null), 500);
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
</style>
