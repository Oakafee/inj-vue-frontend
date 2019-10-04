import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

const store = new Vuex.Store({
	state: {
		mobileNavOpen: false,
		articleList: {},
		mapFeaturesList: {},
		articleDetail: {},
		articleMapFeature: {},
		articleCommentary: {},
		editPermission: true,
		editableArticle: null,
		editMapFeature: false,
		newMapFeature: {},
		geoCategories: {},
	},
	mutations: {
		toggleMobileNav (state) {
			state.mobileNavOpen = !state.mobileNavOpen;
		},
		updateArticleList(state, articles) {
			state.articleList = articles;
		},
		updateMapFeaturesList(state, features) {
			state.mapFeaturesList = features;
		},
		getArticleDetail(state, articleDetail) {
			state.articleDetail = articleDetail;
		},
		getArticleCommentary(state, comments) {
			state.articleCommentary = comments;
		},
		updateArticleMapFeature(state, mapFeature) {
			state.articleMapFeature = mapFeature;
		},
		editArticle (state, slug) {
			state.editableArticle = slug;
		},
		addComment(state, comment) {
			state.articleCommentary.push(comment);
		},
		toggleEditMapFeature(state) {
			state.editMapFeature = !state.editMapFeature;
		},
		addNewMapFeature(state, feature) {
			state.newMapFeature = feature;
		},
		getGeoCategories(state, cats) {
			state.geoCategories = cats;
		}
	}
});

export default store;
