<template>
    <div class="products-search">
        <div class="header">
            <sui-input v-model="searchText" icon="search" placeholder="Type to search"/>
            <sui-button :disabled="!searchText" @click="clear" class="clear-btn">Clear</sui-button>
            <sui-button @click="close" class="clear-btn">Close</sui-button>
        </div>
        <div class="items">
            <ProductItem v-for="p in items" :key="p.id" :item="p"/>
            <div v-if="items.length == 0" class="empty-text">No result!</div>
        </div>
    </div>
</template>

<script>
import { mapState } from 'vuex';
import utils from '@/utils';
import ProductItem from './Item.vue';
export default {
    components: {
        ProductItem
    },
    computed: mapState(['productsArray', 'app']),
    data:() => ({
        searchText: '',
        items: [],
    }),
    watch:{
        searchText(){
            this.startSearch();
        }
    },
    methods: {
        clear(){
            this.searchText = '';
        },

        search(){
            const limit = 40;
            const query = this.searchText.trim().toLowerCase();
            const list = this.productsArray;
            const len = list.length;
            const result = [];
            for(let i = 0; i < len; i++){
                const p = list[i];
                const name = p.name.toLowerCase();
                if(name.includes(query)){
                    result.push(p);
                }
            }
            this.items = result;
        },
        close(){
            this.app.showProductsSearch = false;
        }
    },
    mounted(){
        this.search();
    },
    created(){
        this.startSearch = utils.debounce(() => this.search(), 100);
    }
}
</script>

<style lang="scss" scoped>
.products-search{
    width: 100%;
    height: 100%;
    overflow-x: hidden;
    overflow-y: scroll;
    padding-top: 46px;
    .header{
        width: 100%;
        height: 46px;
        box-sizing: border-box;
        padding: 4px;
        text-align: left;
        background-color: #2185D0;
        position: absolute;
        z-index: 1;
        top: 0;
    }
    .clear-btn{
        height: 100%;
        margin-left: 4px;
        position: relative;
        top: -1px;
    }
    .items{
        width: calc(100% - 0.8rem);
        display: grid;
        grid-template-columns: repeat(6, calc(100% / 6));
        grid-column-gap: 0.2rem;
        grid-row-gap: 0.2rem;
        padding: 0.3rem;
    }
    @media only screen and (max-width: 1400px){
        .items{
            grid-template-columns: repeat(5, calc(100% / 5));
        }
    }
    div.empty-text{
        margin: auto;
        padding-top: 3.7rem;
        font-style: italic;
        text-align: center;
        font-size: 1.5rem;
        color: #aaa;
        grid-column: 6 span;
    }
}
</style>