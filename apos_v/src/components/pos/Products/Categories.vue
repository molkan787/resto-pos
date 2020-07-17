<template>
    <div class="categories-root">
        <sui-button class="item" v-for="category in categories" :key="category.id"
            @click="itemClick(category.id)" :class="{selected: selected == category.id}" >
                {{ category.name }}
            </sui-button>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import {mapState} from 'vuex';
import { Prop } from 'vue-property-decorator';

@Component({
    computed: {
        ...mapState(['pos'])
    }
})
export default class Categories extends Vue{

    @Prop({})
    public selected: number;

    @Prop({})
    public categories: Object[];

    itemClick(id: any){
        this.$emit('catSelected', id);
    }

}
</script>

<style lang="scss" scoped>
.categories-root{
    display: grid;
    grid-template-columns: repeat(6, calc(100% / 6));
    grid-column-gap: 0.2rem;
    grid-row-gap: 0.2rem;
    margin-left: -0.5rem;
    padding: 0 0.8rem 0.5rem 0.5rem;
}
@media only screen and (max-width: 1400px){
    .categories-root{
        grid-template-columns: repeat(5, calc(100% / 5));
    }
}
.item{
    display: inline-block;
    width: 100%;
    padding: 1.2rem 0;
    font-size: 1.2rem;
    text-transform: uppercase;
    border: 1px dotted #666;
    &.selected{
        background-color: #52b0f7 !important;
        color: white;
    }
}
</style>


