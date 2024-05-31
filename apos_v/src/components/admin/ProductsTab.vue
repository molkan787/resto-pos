<template>
    <div class="root">
        <div class="ui vertical segments">
            <div class="ui segment" style="text-align: left;">
                <button @click="loadMenuClick" class="ui button">Load Menu</button>
            </div>
            <div class="ui segment">
                <sui-grid :columns="2" relaxed="very">
                    <sui-grid-column class="left-column">
                        <Categories @change="categoryChanged" />
                    </sui-grid-column>
                    <sui-divider vertical>and</sui-divider>
                    <sui-grid-column class="right-column">
                        <Products :bus="productsBus" />
                    </sui-grid-column>
                </sui-grid>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import Categories from './Categories.vue'
import Products from './Products.vue'
import { MenuParser } from '../../Libs/MenuParser'
import MxHelper from '@/prs/MxHelper';

@Component({
    components: {
        Categories,
        Products,
    }
})
export default class ProductsTab extends Vue {
    private productsBus: Vue = new Vue();
    private _MenuParser = new MenuParser()

    categoryChanged(catID: any){
        if(catID == '+'){
            this.productsBus.$emit('setCat', '');
        }else{
            this.productsBus.$emit('setCat', catID);
        }
    }

    loadMenuClick(){
        // @ts-ignore
        MxHelper.openMenuLoader()
    }

}
</script>

<style lang="scss" scoped>
$left-col-w: 30rem;
.left-column{
    width: $left-col-w !important;
}
.right-column{
    width: calc(100% - #{$left-col-w}) !important;
}
</style>