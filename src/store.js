import Vue from 'vue';
import Vuex from 'vuex';

import functions from './functions';

Vue.use(Vuex);

const store = new Vuex.Store({
	state: {
		mobileNavOpen: false,
		articleList: [],
		mapFeaturesList: {}, // an object not an array, bc it's a GeoJSON feature collect
		articleDetail: {},
		articleMapFeature: {},
		articleCommentary: [],
		editPermission: true,
		editableArticle: null,
		// is this below being used?
		editMapFeature: false,
		newMapFeature: {},
		geoCategories: [],
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
		},
		addMapFeatureToList(state, feature) {
			if (state.mapFeaturesList.features) {
				state.mapFeaturesList.features.push(feature);
			}
			// else do nothing. when the map loads it will get all of the features including the new one from the server
		},
		replaceMapFeatureInList(state, feature) {
			let index = state.mapFeaturesList.features.findIndex((listItem) =>
				listItem.properties.slug === feature.properties.slug
			);
			state.mapFeaturesList.features[index] = feature;
		},
		removeMapFeatureFromList(state, feature) {
			let index = state.mapFeaturesList.features.findIndex((listItem) =>
				listItem.properties.slug === feature.properties.slug
			);
			state.mapFeaturesList.features.splice(index, 1);
		},
		addArticleToList(state, articleDetail) {
			let listInfo = {
				"title": articleDetail.title,
				"slug": articleDetail.slug,
				"pk": articleDetail.pk,
				"parent": articleDetail.parent,
				"main_cat": false,
			};
			state.articleList.push(listInfo);
		}
	}
});

export default store;
