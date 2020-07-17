<template>
    <div class="products-root">
        <h2>
            {{ headerText }}
            <sui-button :disabled="!catID" class="add" icon="plus circle" @click="addNew"></sui-button>
        </h2>
        <hr>
        <div class="items">
            <ProductItem v-for="(item, index) in items" :key="index"
            :item="item" @editClick="editClick" @deleteClick="deleteClick"/>
            
            <div v-if="noCat" class="empty-text">No Category Selected.</div>
            <div v-else-if="items.length == 0" class="empty-text">This Category is empty!</div>
        </div>
    </div>
</template>

<script lang="ts">
// @ts-nocheck
import Vue from 'vue';
import {mapState, mapActions} from 'vuex';
import MxHelper from '@/prs/MxHelper';
import DS from '@/prs/ds';
import Message from '@/ccs/Message';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import ProductItem from './ProductItem.vue';

@Component({
    components: {
        ProductItem,
    },
    computed: {
        ...mapState(['products', 'productsByIds', 'categoriesByIds']),
        headerText(){
            const cat = this.categoriesByIds[this.catID];
            return cat ? cat.name.toUpperCase() + ': Products' : 'Products';
        }
    },
})
export default class Products extends Vue{
    
    @Prop({default: null}) bus!: Vue;

    private items: any[] = [];
    private catID: any = '';
    private noCat: boolean = true;

    editClick(id: any){
        MxHelper.editProduct(id, this.catID);
    }

    deleteClick(id: any){
        const p = this.productsByIds[id];
        Message.ask(`Do really want to delete product "${p.name}" ?`).then(e => {
            if(e.answer){
                e.loading();
                DS.deleteProduct(id).then(() => {
                    e.hide();
                }).catch(error => {
                    console.log(error)
                    e.dialog.show('We could not complete the action, You may be offline.');
                })
            }else{
                e.hide();
            }
        });
    }

    addNew(){
        MxHelper.editProduct('new', this.catID);
    }

    update(catID: any){
        this.catID = catID;
        if(catID == -1 || catID == '+'){
            this.items = [];
            this.noCat = true;
        }else{
            const prts = this.products[catID];
            this.items = prts || [];
            this.noCat = false;
        }
    }

    created(){
        if(this.bus){
            this.bus.$on('setCat', (catID: any) => {
                this.update(catID);
            });
        }
    }
}
</script>

<style lang="scss" scoped>
.products-root{
    height: calc(100vh - 8rem);
}
.items{
    height: calc(100% - 7rem);
    overflow-y: scroll;
    overflow-x: hidden;
    padding-right: 3px;
}
div.empty-text{
    padding-top: 3.7rem;
    font-style: italic;
    text-align: center;
    font-size: 1.5rem;
    color: #aaa;
}
button.add{
    float: right;
}
</style>
