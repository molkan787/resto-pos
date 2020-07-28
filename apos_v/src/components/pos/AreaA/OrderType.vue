<template>
    <sui-button-group class="order-type buttons-group">
        <sui-button v-if="ots.table" class="ot-button" @click="typeClick('table')" :color="type == 'table' ? 'green' : null">Table</sui-button>
        <sui-button v-if="ots.delivery" class="ot-button" @click="typeClick('delivery')" :color="type == 'delivery' ? 'green' : null">Delivery</sui-button>
        <sui-button v-if="ots.collection" class="ot-button" @click="typeClick('collection')" :color="type == 'collection' ? 'green' : null">Collection</sui-button>
    </sui-button-group>
</template>

<script>
import { mapState } from 'vuex';
export default {
    computed: mapState({
        app: state => state.app,
        pos: state => state.pos,
        type: state => state.pos.orderType,
        ots: state => state.order_types,
    }),
    methods: {
        typeClick(type){
            this.pos.orderType = type;
            this.app.showOrderTypeDetails = true;
        }
    }
}
</script>

<style lang="scss" scoped>
.ot-button{
    height: 100%;
}
@media only screen and (max-width: 1320px){
    .order-type button{
        padding-left: 15px !important;
        padding-right: 15px !important;
    }
}
@media only screen and (max-width: 1220px){
    .order-type button{
        padding-left: 10px !important;
        padding-right: 10px !important;
    }
}
@media only screen and (max-width: 1100px){
    .order-type button{
        padding-left: 3px !important;
        padding-right: 3px !important;
    }
}
</style>