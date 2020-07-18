<template>
    <div>
        <h2>
            Vendors list
            <v-btn @click="addVendorClick" small elevation="0" class="fr">
                <v-icon x-small class="mr-1">fa-plus</v-icon>
                Add new Vendor
            </v-btn>
        </h2>
        <v-data-table
            dense
            disable-sort
            :loading="loading"
            :items-per-page="10"
            :server-items-length="totalCount"
            :headers="headers"
            :items="items"
            :footer-props="{
                'items-per-page-options': [5, 10, 20, 30, 40, 50]
            }"
            item-key="vendor_id"
            @pagination="pagination"
        />
        <EditVendorModal ref="editVendorModal" />
    </div>
</template>

<script>
import DataManager from '../services/data-manager';
import EditVendorModal from '../components/EditVendorModal';
export default {
    components: {
        EditVendorModal
    },
    data: () => ({
        loading: true,
        headers: [
            {
                text: 'Vendor ID',
                value: 'vendor_id',
            },
            {
                text: 'Vendor Name',
                value: 'vendor_name'
            },
            {
                text: 'Owner',
                value: 'owner_fullname'
            },
            {
                text: 'Phone #',
                value: 'vendor_phone'
            },
            {
                text: 'Address',
                value: 'vendor_address'
            }
        ],
        totalCount: 0,
        items: []
    }),
    methods: {
        pagination({ pageStart, itemsPerPage }){
            this.loadItems(pageStart, itemsPerPage);
        },
        async loadItems(offset, limit){
            this.loading = true;
            const { items, total } = await DataManager.loadVendors(offset || 0, limit || 10);
            this.items = items;
            this.totalCount = total;
            this.loading = false;
        },
        addVendorClick(){
            this.$refs.editVendorModal.edit('new');
        }
    },
    created(){
        this.loadItems();
    }
}
</script>

<style scoped>
.fr{
    float: right;
}
</style>