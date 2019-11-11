import Vue from 'vue';
import VueRouter from 'vue-router';

import store from './store.js';
import Home from './components/Home.vue';
import Article from './components/Article.vue';
import ArticleAdd from './components/ArticleAdd.vue';
import FourOhFour from './components/FourOhFour.vue';

Vue.use(VueRouter);

const router = new VueRouter({
	// history mode allows it to avoid using the hash
	// mode: 'history',
	routes: [
		// dynamic segments start with a colon
		{ path: '/new-article/', name: 'new-article', component: ArticleAdd },		
		{ path: '/:slug/', component: Article },
		{ path: '/', name: 'home', component: Home },
		{ path: '*', name: '404', component: FourOhFour },
	],
	// this makes it so that you scroll to the top of the page when you navigate to a new article
	scrollBehavior() {
		return { x: 0, y: 0 }
	},
});

router.beforeEach((to, from, next) => {
	if (store.state.mobileNavOpen) {
		store.commit('toggleMobileNav', false);
	}
	let changeRoute = true;
	if (store.state.editInProgress) {
	//TODO: improve this second condition
		store.commit('saveDialogIntervention', to);
		changeRoute = false;
	}
	if (changeRoute && store.state.articleMapExpanded) {
		store.commit('toggleArticleMapSize', false);
	}
	next(changeRoute);
});

export default router;