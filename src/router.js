import Vue from 'vue';
import VueRouter from 'vue-router';

import Home from './components/Home.vue';
import Article from './components/Article.vue';
import FourOhFour from './components/FourOhFour.vue';

Vue.use(VueRouter);

const router = new VueRouter({
	// history mode allows it to avoid using the hash
	// mode: 'history',
	routes: [
		// dynamic segments start with a colon
		{ path: '/:slug/', component: Article },
		{ path: '/', name: 'home', component: Home },
		{ path: '*', name: '404', component: FourOhFour },
	],
	// this makes it so that you scroll to the top of the page when you navigate to a new article
	scrollBehavior() {
		return { x: 0, y: 0 }
	},
});

export default router;