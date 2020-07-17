<template>
    <div class="product-item">
        <span>{{ item.name }}</span>
        <span>{{ item.price | price }}</span>
        <div class="btn" @click="deleteClick">
            <i class="trash icon"></i>
            Delete
        </div>
        <div class="btn" @click="editClick">
            <i class="edit icon"></i>
            Edit
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import {mapActions, mapState} from 'vuex';
import { Prop } from 'vue-property-decorator';
import MxHelper from '@/prs/MxHelper';

@Component({
    computed: { ...mapState(['pos']) },
})
export default class Item extends Vue{

    @Prop({default: {}}) item!: any;

    private count: any = 0;

    editClick(){
        this.$emit('editClick', this.item.id);
    }

    deleteClick(){
        this.$emit('deleteClick', this.item.id);
    }

}
</script>

<style lang="scss" scoped>
@import '@/scss/vars.scss';
.product-item{
    width: 100%;
    padding: 10px;
    font-size: 19px;
    text-align: left;
    border-bottom: 1px solid #e2e2e2;
    &:hover{
        background-color: rgb(241, 241, 241);
    }
    span{
        display: inline-block;
        width: 25%;
    }
    .btn{
        display: inline-block;
        float: right;
        margin-left: 3rem;
        cursor: pointer;
    }
}
</style>
