<template>
    <sui-tab class="root">
        <sui-tab-pane title="Reports" icon="chart bar" v-if="userType < 4">
            <ReportsTab />
        </sui-tab-pane>

        <sui-tab-pane title="Orders" icon="boxes">
            <OrdersTab />
        </sui-tab-pane>

        <!-- <sui-tab-pane title="Prepaid Cards" icon="ticket" v-if="userType < 4">
            <PrepaidCardTab />
        </sui-tab-pane>

        <sui-tab-pane title="Loyalty Cards" icon="ticket" v-if="userType < 4">
            <LoyaltyCardTab />
        </sui-tab-pane> -->

        <sui-tab-pane title="Clients" icon="users">
            <ClientsTab />
        </sui-tab-pane>

        <sui-tab-pane title="Menu" icon="box" v-if="userType < 4">
            <ProductsTab />
        </sui-tab-pane>

        <sui-tab-pane title="Offers" icon="gift" v-if="userType < 4">
            <OffersTab />
        </sui-tab-pane>

        <sui-tab-pane title="Users" icon="user circle" v-if="userType <= 2">
            <UsersTab />
        </sui-tab-pane>

        <sui-tab-pane title="Setting" icon="setting" v-if="userType <= 2">
            <SettingTab />
        </sui-tab-pane>

        <sui-tab-pane title="Sync" icon="sync" v-if="userType <= 2">
            <MurewSyncTab />
        </sui-tab-pane>

    </sui-tab>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import OrdersTab from './OrdersTab.vue';
import PrepaidCardTab from './PrepaidCardTab.vue';
import LoyaltyCardTab from './LoyaltyCardTab.vue';
import ClientsTab from './ClientsTab.vue';
import ReportsTab from './ReportsTab.vue';
import ProductsTab from './ProductsTab.vue';
import OffersTab from './OffersTab.vue';
import UsersTab from './UsersTab.vue';
import SettingTab from './SettingTab.vue';
import MurewSyncTab from './MurewSyncTab.vue';
import {mapGetters} from 'vuex';

@Component({
    components: {
        OrdersTab,
        PrepaidCardTab,
        LoyaltyCardTab,
        ClientsTab,
        ReportsTab,
        ProductsTab,
        OffersTab,
        UsersTab,
        SettingTab,
        MurewSyncTab,
    },
    computed: mapGetters(['userType']),
})
export default class Body extends Vue{}
</script>

<style lang="scss" scoped>
div.root{
    height: calc(100vh - 6rem);
    div.tab{
        border-bottom: none;
    }
}
</style>

<style lang="scss">
div.root > div.menu{
    font-size: 1.3rem;
    height: 3.5rem;
    min-height: 0 !important;
    padding-left: 0.5rem;
    padding-top: 2px;
    background-color: #f9f9f9 !important;
    a.item{
        padding: 0 2rem 0.3rem 2rem !important;
        background-color: #f9f9f9 !important;
        &.active{
            background-color: white !important;
        }
    }
}
</style>
