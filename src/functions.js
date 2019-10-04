import axios from 'axios';

import store from './store.js';
import constants from './constants';
import router from './router.js';

export default {
	getArticleList() {
		let apiUrl = constants.API_BASE_URL + constants.API_PATH;
		
		axios.get(apiUrl)
			.then((response) => {
				// handle success
				store.commit('updateArticleList', response.data);
				return 'it worked';
			})
			.catch((error) => {
				// TODO: show general server error message page
				console.log('article list call failed');
				return error;
			});
	},
	getMapFeatureList() {
		let apiUrl = constants.API_BASE_URL + 'map/';
		let self = this;
		
		axios.get(apiUrl)
			.then((response) => {
				let featuresList = [];
				let featureCollection = {};
				response.data.map((feature) => {
					featuresList.push(self.structureGeoJsonForMap(feature));
				});
				featureCollection = {
					"type": "FeatureCollection",
					"features": featuresList
				}
				store.commit('updateMapFeaturesList', featureCollection);
			})
			.catch((error) => {
				// TODO: show general server error message page?
				console.log('map feature list call failed ', error);
				return error;
			});
	},
	// Functions for loading article data
	
	getArticleDetails(slug) {
		let apiUrl = constants.API_BASE_URL + constants.API_PATH + slug + '/';
		let self = this;
		
		axios.get(apiUrl)
		.then((response) => {
				// handle success
				store.commit('getArticleDetail', response.data);
				if (response.data.geo_coordinates) {
					let mapFeature = self.structureGeoJsonForMap(response.data);
					store.commit('updateArticleMapFeature', mapFeature);
				} else {
					store.commit('updateArticleMapFeature', {});
				}
				if (response.data.comments) {
					self.getCommentary(response.data.pk);
				}
			})
			.catch((error) => {
				// handle error
				router.push({ name: '404' });
				console.log('error with loading article: ', error);
				return error;
			});
	},
	structureGeoJsonForMap(data) {
		return {
			"type": "Feature",
			"properties": {
				"name": data.title,
				"slug": data.slug,
				"category": data.geo_category
			},
			"geometry": {
				"type": data.geo_type,
				"coordinates": JSON.parse(data.geo_coordinates)
			}
		}
	},
	destructureGeoJsonForDb(feature) {
		return {
			'geo_type': feature.geometry.type,
			'geo_coordinates': JSON.stringify(feature.geometry.coordinates),
			'geo_category': feature.properties.category
		}
	},
	getCommentary(articlePk) {
		let apiUrl = constants.API_BASE_URL + 'commentary/' + articlePk + '/';
		let self = this;
		
		axios.get(apiUrl)
			.then(function (response) {
				// handle success
				store.commit('getArticleCommentary', response.data);
			})
			.catch(function (error) {
				// handle error, not sure what to do in this case
				self.commentaryInfo = 'sad, there was an error';
				return error;
			});
	},
	getGeoCategories() {
		let apiUrl = constants.API_BASE_URL + 'geo-categories/';

		axios.get(apiUrl)
			.then(function (response) {
				// handle success
				store.commit('getGeoCategories', response.data);
			})
			.catch(function (error) {
				// handle error, not sure what to do in this case
				console.log('sad, the geo category lookup failed')
				return error;
			});
	}
}