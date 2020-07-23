window.DEV = typeof window.webpackHotUpdate != 'undefined';
import Vue from 'vue'
import App from './App.vue'
import Modal from './components/templates/Modal.vue';
import router from './router'
import store from './store'
import Session from './services/session';
import vuetify from './plugins/vuetify';
import 'roboto-fontface/css/roboto/roboto-fontface.css'
import '@fortawesome/fontawesome-free/css/all.css'

Vue.config.productionTip = false

Vue.component('modal', Modal);

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App)
}).$mount('#app')

Session.loadState();