<template>
  <div id="app">
    <keep-alive>
      <router-view/>
    </keep-alive>
    <CustomValueModal />
    <PrepaidCardModal />
    <LoyaltyCardModal />
    <MessageModal />
    <InActiveModal />
    <OptionsModal />
    <ClientModal />
    <ReasonModal />
    <ImportDataModal />
    <ExportDataModal />
    <EditCardBarcodeModal />
    <AddLoyaltyPointsModal />
    <PasswordModal />
    <PrintersSetup />
    <PrinterSelector />
    <CategoryModal />
    <CashoutModal />
    <RecentOrdersModal />
    <OnlineOrderModal />
    <OnlineOrdersModal />
    <BookingListModal />
    <EditOfferModal />
    <AddBookingModal />
    <OrderDetailsModal />
    <AssignTablesModal />
    
    <div class="demo-label" v-if="demoMode">
      DEMO / TESTING
    </div>

    <portal-target name="semantic-ui-vue" />
  </div>
</template>

<script lang="ts">
// @ts-nocheck
import Vue from 'vue';
import {mapActions, mapState} from 'vuex';
import EFF from '@/drivers/eff';
import CustomValueModal from './components/Helpers/CustomValueModal.vue';
import PrepaidCardModal from './components/pre/PrepaidCardModal.vue';
import LoyaltyCardModal from './components/pre/LoyaltyCardModal.vue';
import MessageModal from './components/pre/MessageModal.vue';
import InActiveModal from './components/pre/InActiveModal.vue';
import OptionsModal from './components/pre/OptionsModal.vue';
import ClientModal from './components/pre/ClientModal.vue';
import ReasonModal from './components/pre/ReasonModal.vue';
import ImportDataModal from './components/pre/ImportDataModal.vue';
import ExportDataModal from './components/pre/ExportDataModal.vue';
import EditCardBarcodeModal from './components/pre/EditCardBarcodeModal.vue';
import AddLoyaltyPointsModal from './components/pre/AddLoyaltyPointsModal.vue';
import PasswordModal from './components/pre/PasswordModal.vue';
import PrinterSelector from './components/pre/PrinterSelector.vue';
import PrintersSetup from './components/pre/PrintersSetup.vue';
import CategoryModal from './components/pre/CategoryModal.vue';
import CashoutModal from './components/pre/CashoutModal.vue';
import RecentOrdersModal from './components/pre/RecentOrdersModal.vue';
import OnlineOrderModal from './components/pre/OnlineOrderModal.vue';
import OnlineOrdersModal from './components/pre/OnlineOrdersModal.vue';
import BookingListModal from './components/booking/BookingListModal.vue';
import AddBookingModal from './components/booking/AddBookingModal.vue';
import AssignTablesModal from './components/booking/AssignTablesModal.vue';
import EditOfferModal from './components/pre/EditOfferModal.vue';
import OrderDetailsModal from './components/pre/OrderDetailsModal.vue';

export default Vue.extend({
  components: {
    CustomValueModal,
    PrepaidCardModal,
    LoyaltyCardModal,
    MessageModal,
    InActiveModal,
    OptionsModal,
    ClientModal,
    ReasonModal,
    ImportDataModal,
    ExportDataModal,
    EditCardBarcodeModal,
    AddLoyaltyPointsModal,
    PasswordModal,
    PrinterSelector,
    PrintersSetup,
    CategoryModal,
    CashoutModal,
    RecentOrdersModal,
    OnlineOrderModal,
    OnlineOrdersModal,
    BookingListModal,
    AddBookingModal,
    EditOfferModal,
    OrderDetailsModal,
    AssignTablesModal
  },
  methods: {
    ...mapActions(['setup'])
  },
  computed: mapState(['demoMode']),

  created(){
    this.setup();
    // this.$router.push('pos');
     document.addEventListener("keydown", (e: any) => {
        if (e.which === 120) {
            EFF.openDevTools();
        }
    });
  }
});
</script>


<style lang="scss">
@import '@/scss/vars.scss';
@import '@/scss/global.scss';
body{
  padding: 0;
  margin: 0;
  padding-top: $navbar-h;
}
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
#nav {
  position: fixed;
  z-index: 1000;
  top: 0; left: 0;
  width: 100%;
  height: $navbar-h;
  padding: 10px;
  box-sizing: border-box;
  background-color: #fafafa;
  box-shadow: 0 0 6px #999;
  a {
    font-weight: bold;
    color: #2c3e50;
    &.router-link-exact-active {
      color: #42b983;
    }
  }
}

$dl-w: 14rem;
.demo-label{
  position: fixed;
  top: 0;
  left: 50%;
  margin-left: $dl-w / -2;
  width: $dl-w;
  height: 2rem;
  background-color: #42b983;
  color: white;
  border: 1px solid #2b865d;
  font-size: 1.2rem;
  box-sizing: border-box;
  padding-top: 0.2rem;
  font-weight: bold;
  box-shadow: 0 0 3px #2b865d;
  border-bottom-left-radius: 100px;
  border-bottom-right-radius: 100px;
  user-select: none;
}
</style>
