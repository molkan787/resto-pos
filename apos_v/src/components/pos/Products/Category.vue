<template>
    <div class="category-root">
        <ProductItem v-for="item in items" :key="item.id"
        :item="item" @resetTimer="resetTimer"/>

        <div v-if="items.length == 0" class="empty-text">This Category is empty</div>
    </div>
</template>

<script lang="ts">
// @ts-nocheck
import Vue from 'vue';
import {mapState, mapActions} from 'vuex';
import Component from 'vue-class-component';
import { Prop, Watch } from 'vue-property-decorator';
import ProductItem from './Item.vue';

@Component({
    components: {
        ProductItem,
    },
    computed: {
        ...mapState(['products']),
    },
    watch: {
        catID(){
            this.loadProducts();
        }
    }
})
export default class Category extends Vue{
    @Prop({default: ''}) catID!: string;

    private items: any[] = [];

    resetTimer(){
        this.$emit('resetTimer');
    }

    loadProducts(){
        const prts = this.products[this.catID];
        this.items = prts || [];
    }

    mounted(){
        this.loadProducts();
    }
}
</script>

<style lang="scss" scoped>
.category-root{
    display: grid;
    grid-template-columns: repeat(6, calc(100% / 6));
    grid-column-gap: 0.2rem;
    grid-row-gap: 0.2rem;
    margin-left: -0.5rem;
    padding: 0 1rem 0.5rem 0.5rem;
}
@media only screen and (max-width: 1400px){
    .category-root{
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
.placeholder{
    display: inline-block;
    width: 19.5%;
    height: 6rem;
}
</style>
