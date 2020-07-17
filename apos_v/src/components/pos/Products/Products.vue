<template>
    <div class="root">
        <!-- <div class="header" :class="headerClass">
            <sui-icon v-if="catID != 'all'" name="arrow left" class="backBtn" @click="goBack" />
            <span v-html="headerText"></span>
        </div> -->
        <div class="items-container">
            <Categories :categories="categories" :selected="catID" @catSelected="categorySelected" />
            <template v-if="subCategories">
                <hr>
                <Categories :categories="subCategories" :selected="subCatID" @catSelected="subCategorySelected" />
            </template>
            <template v-if="catID != 'all'">
                <hr>
                <Category :catID="subCatID || catID" @resetTimer="resetTimer" />
            </template>
        </div>
    </div>
</template>

<script lang="ts">
// @ts-nocheck
import Vue from 'vue';
import {mapGetters, mapState} from 'vuex';
import Comu from '@/prs/comu';
import Component from 'vue-class-component';
import Categories from './Categories.vue';
import Category from './Category.vue';
import Modal from '../../Elts/Modal.vue';

@Component({
    components: {
        Categories,
        Category,
        Modal
    },
    computed: {
        ...mapState(['categories', 'categoriesByIds', 'products']),
        ...mapGetters(['pos']),
        displayProducts(){
            return true;
            const cat = this.categoriesByIds[this.catID];
            if(!cat.childs || cat.childs.length == 0) return true;
            const products = this.products[this.catID];
            return products && products.length > 0;
        },
        subCategories(){
            const cat = this.categoriesByIds[this.catID];
            if(cat && cat.childs && cat.childs.length > 0){
                return cat.childs;
            }else{
                return null;
            }
        },
        headerClass(){
            return this.catID == 'all' ? 'normal' : 'highlighted';
        },
        headerText(){
            if(this.catID == 'all'){
                return 'Categories';
            }else{
                const path = [];
                const cat = this.categoriesByIds[this.catID];
                if(cat.parent_id > 0){
                    const parent = this.categoriesByIds[cat.parent_id];
                    path.push(parent.name)
                }
                path.push(cat.name);
                return path.join('&nbsp;&nbsp;&nbsp;>&nbsp;&nbsp;&nbsp;');
            }
        }
    },
})
export default class Products extends Vue{

    private suffix: string = 'Regular';
    private catID: string = 'all';
    private subCatID: string = null;

    private goBackTimer = 0;

    categorySelected(cat_id: any){
        this.catID = cat_id;
        this.subCatID = null;
    }

    subCategorySelected(cat_id: any){
        this.subCatID = cat_id;
    }

    goBack(){
        // @ts-ignore
        const cat = this.categoriesByIds[this.catID];
        if(cat && cat.parent_id > 0){
            this.catID = cat.parent_id;
        }else{
            this.catID = 'all';
        }
    }

    reset(){
        this.catID = 'all';
        this.subCatID = null;
    }

    resetTimer(){
        // if(this.goBackTimer) clearTimeout(this.goBackTimer);

        // if(!Comu.settings.getItem('categoryAutoBack')) return;
        
        // this.goBackTimer = setTimeout(() => this.reset(), 1000);
    }

    created(){
        Comu.registerToReset(this);
        this.reset();
    }
    
}
</script>

<style lang="scss" scoped>
@import '@/scss/vars.scss';
$header-h: 2.6rem;
div.root{
    // padding-top: $header-h !important;
    height: 100%;
}
.header{
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: $header-h;
    padding: 0.5rem;
    color: white;
    font-size: 1.2rem;
    font-weight: bold;
    box-shadow: 0 0 4px #a2a2a2;
}
.items-container{
    height: 100%;
    overflow-x: hidden;
    overflow-y: scroll;
    padding: 5px;
}
.label{
    opacity: 0.7;
    font-weight: normal;
    font-style: italic;
}
.backBtn{
    width: 5rem;
    height: 5rem;
    float: left;
    margin-top: -2rem;
    margin-left: -1.7rem;
    margin-right: -5rem;
    padding-top: 2.05rem;
}
.normal{
    background-color: #E0E1E2;
    color: #5A5A5A;
}
.highlighted{
    background-color: $blue;
    color: white;
}
hr{
    margin-top: 0;
}
</style>
