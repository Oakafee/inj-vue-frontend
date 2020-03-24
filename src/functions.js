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
		
		//store.commit('getArticleDetail', {}); //this would be so if it takes a while to load, we get to look at blank stuff instead of the previous article. TODO: loading stuff
		axios({
			method: 'get',
			url: apiUrl,
			//headers: {'Authorization': 'Token 9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b'}
		})
		.then((response) => {
				// handle success
				store.commit('getArticleDetail', response.data);
				self.getCommentary(response.data.pk);
			})
			.catch((error) => {
				// handle error
				router.push({ name: '404' });
				console.log('error with loading article: ', error);
				return error;
			});
	},
	structureGeoJsonForMap(data) {
		if (data.geo_coordinates) {
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
		} else {
			return {}
		}
	},
	destructureGeoJsonForDb(feature) {
		if (feature.geometry) {
			if (feature.geometry.coordinates) {
				return {
					'geo_type': feature.geometry.type,
					'geo_coordinates': JSON.stringify(feature.geometry.coordinates),
					'geo_category': feature.properties.category
				}
			}
		}
		return {
			'geo_type': "",
			'geo_coordinates': "",
			'geo_category': null
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
				console.log('error with getting the article\'s comments', error);
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
				return error;
			});
	},
	getMapClassName(feature, hoverable) {
		let specificClass = constants.MAP_FEATURE_CLASS_NAMES[feature.properties.category]
		
		if (hoverable) {
			return `inj-map-feature__home ${specificClass}`
		}
		return specificClass;
	},
	enableScrollWheelZoom(map) {
		map.scrollWheelZoom.enable();
	},
	resetMapFeature(feature, newMapFeature) {
		// do I want/need this if condition?
		if(newMapFeature.geometry) {
			store.commit('addNewMapFeature', {});
		}
		store.commit('getArticleDetail', feature);
		store.commit('editArticle', null);
	},
	editInProgress(editing) {
		if (editing) store.commit('editInProgress', true)
		else store.commit('editInProgress', false);	
	},
	authHeader(token) {
		return {'Authorization': `Token ${token}`}
	},
	getUserInfo(username, authToken) {
		axios({
			method: 'get',
			url: `${constants.API_BASE_URL}users/${username}/`,
			headers: this.authHeader(authToken),
		})
		.then((response) => {
			store.commit('getUserInfo', response.data);
		})
		.catch((error) => {
			// handle error
			console.log("couldn't get user info: " + error);
		});
	},
	randomCode() {
		return Math.floor(Math.random() * 1000000).toString();
	},
	usernameValidation(username) {
	    const re = /^[A-Za-z0-9]+(?:[ _-][A-Za-z0-9]+)*$/;
		return re.test(String(username));
	},
	emailValidation(email) {
	    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		return re.test(String(email).toLowerCase());
	},
	formatDate(rawDate) {
		let niceDate = new Date(rawDate);
		return niceDate.toLocaleString('default', constants.DATE_FORMAT);	
	}
}