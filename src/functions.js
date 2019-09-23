import axios from 'axios';

import store from './store.js';
import constants from './constants';

export default {
	getArticleList() {
		let apiUrl = constants.API_BASE_URL + constants.API_PATH;
		
		axios.get(apiUrl)
			.then(function (response) {
				// handle success
				store.commit('updateArticleList', response.data);
				return 'it worked';
			})
			.catch(function (error) {
				// handle error, what to do?
				console.log('article list call failed');
				return error;
			});
	},
}