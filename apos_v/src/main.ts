import './my-polifill';
import config from './config';
import Vue from 'vue';
import filters from './filters/';
// @ts-ignore
import SuiVue from 'semantic-ui-vue';
import PortalVue from 'portal-vue';
import Datetime from 'vue-datetime';
import Toastr from 'vue-semantic-ui-toastr';
import Datepicker from 'vuejs-datepicker';
import App from './App.vue';
import router from './router';
import store from './store';
import 'vue-datetime/dist/vue-datetime.css';
import './updater';


Vue.config.productionTip = false;

// @ts-ignore
Vue.currencySign = Vue.prototype.currencySign = config.app.currencySign

Vue.use(SuiVue);
Vue.use(PortalVue);
Vue.use(Datetime);
Vue.use(filters);

Vue.component('Datepicker', Datepicker);
Vue.use(Toastr, {
  duration: 3000,
  container: '.toastr-container',
  autoshow: true,
  html: false,
  position: 'top center',
  type: 'success',
})


new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app');
