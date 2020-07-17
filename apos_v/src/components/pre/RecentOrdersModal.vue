<template>
    <Modal size="large" v-model="open" title="Recent orders" :loading="loading" :dialog="dialog" >
        <div class="items-wrapper">
            <RecentOrdersColumn @itemEditClick="itemEditClick" title="Table Orders" detailsHead="Table" :orders="items.table"/>
            <RecentOrdersColumn @itemEditClick="itemEditClick" title="Delivery Orders" detailsHead="Customer" :orders="items.delivery"/>
            <RecentOrdersColumn @itemEditClick="itemEditClick" title="Collection Orders" detailsHead="Customer" :orders="items.collection"/>
        </div>        
        <template v-slot:buttons>
            <button class="ui button" @click="cancel">CLOSE</button>
        </template>
    </Modal>
</template>

<script>
import Modal from '../Elts/Modal.vue';
import MxHelper from '@/prs/MxHelper';
import ModalDialog from '@/ccs/ModalDialog';
import RecentOrdersColumn from './RecentOrdersColumn.vue';
import DM from '@/prs/dm';
import { mapState } from 'vuex';
export default {
    components: {
        Modal,
        RecentOrdersColumn,
    },
    computed: {
        ...mapState(['recentOrders']),
        items(){
            const table = [];
            const delivery = [];
            const collection = [];
            for(let order of this.recentOrders){
                const t = order.type;
                if(t == 'delivery') delivery.push(order);
                else if(t == 'collection') collection.push(order);
                else table.push(order);
            }
            return {
                table,
                delivery,
                collection,
            }
        }
    },
    data: () => ({
        open: false,
        loading: false,
        dialog: new ModalDialog(),
    }),

    methods: {
        cancel(){
            this.open = false;
        },
        async itemEditClick(item){
            this.loading = true;
            try {
                await DM.loadOrder(item.id);
                this.open = false;
            } catch (error) {
                this.dialog.show('An error occured, Please try again');
            }
            this.loading = false;
        },
        handle(){
            return new Promise((resolve, reject) => {
                this.resolve = resolve;
                this.reject = reject;

                this.password = '';
                this.open = true;

            });
        }
    },

    mounted(){
        MxHelper.registerFunction('openRecentOrders', () => this.handle());
    }
}
</script>

<style lang="scss" scoped>
.items-wrapper{
    display: grid;
    grid-template-columns: repeat(3, calc((100% - 20px) / 3));
    column-gap: 10px;
    min-height: 300px;
}
</style>