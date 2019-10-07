import Vue from 'vue';
import Vuex from 'vuex';

import functions from './functions';

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
		// is this below being used?
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
			if (articleDetail.geo_coordinates) {
				let mapFeature = functions.structureGeoJsonForMap(articleDetail);
				state.articleMapFeature = mapFeature;
			} else {
				state.articleMapFeature = {};
			}
		},
		getArticleCommentary(state, comments) {
			state.articleCommentary = comments;
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
