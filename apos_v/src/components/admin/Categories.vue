<template>
    <div class="categories-root">
        <h2>Categories</h2>
        <hr>
        <!-- <Switcher class="type-switcher" v-model="catType" leftText="Regular" rightText="Prepaid"
            @changed="reset"/> -->
        <a href="#" class="add-btn" @click="addCategory(null)">Add Caregory</a>
        <div class="items">
            <CategoryItem v-for="category in categories" :key="category.id"
            :data="category" @itemClick="itemClick" :currentCatId="cat"
            @addClick="addCategory" @deleteClick="deleteCategoryClick" @editClick="editCategoryClick"/>
        </div>
    </div>
</template>

<script lang="ts">
// @ts-nocheck
import Vue from 'vue';
import Component from 'vue-class-component';
import CategoryItem from './CategoryItem.vue';
import {mapState} from 'vuex';
import Message from '@/ccs/Message';
import MxHelper from '@/prs/MxHelper';
import DS from '@/prs/ds';
// import Switcher from '../pre/Switcher.vue';


@Component({
    components: {
        CategoryItem,
    },
    computed: {
        ...mapState(['categories'])
    }
})
export default class Categories extends Vue{

    private catType = '1';
    private cat = -1;

    async editCategoryClick(data){
        MxHelper.editCategory({current: data})
    }

    async deleteCategoryClick(data){
        const objectName = data.parent_id ? 'sub-category' : 'category';
        const msg = `Are you sure you want to delete ${objectName} "${data.name}" ?`;
        const e = await Message.ask(msg);
        if(e.answer){
            e.loading();
            try {
                await DS.deleteCategory(data);
                e.hide();
            } catch (error) {
                console.error(error);
                e.dialog.show('An error occured, Please try again.');
            }
        }else{
            e.hide();
        }
    }

    itemClick(data: any){
        this.cat = data.id;
        this.$emit('change', data.id);
    }

    addCategory(data){
        MxHelper.editCategory({parent: data});
    }

    reset(){
        this.itemClick(-1);
    }

}
</script>

<style scoped>
.categories-root{
    height: calc(100vh - 8rem);
}
.items{
    height: calc(100% - 9rem);
    overflow-y: scroll;
    overflow-x: hidden;
    padding-right: 3px;
}
.add-btn{
    display: inline-block;
    padding: 0.5rem;
    font-size: 1.1rem;
}
</style>

