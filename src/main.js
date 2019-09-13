import Vue from 'vue';

import router from './router.js';
import store from './store.js';

import App from './App.vue';

Vue.config.productionTip = false;

new Vue({
	router,
	store,
	render: h => h(App),
}).$mount('#app')
