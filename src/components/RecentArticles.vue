<template>
<div>
	<h3>Recent Articles </h3>
	<p v-if="serverError">{{ serverError }}</p>
	<ul>
		<li v-for="article in recentArticles" :key="article.pk">
			<router-link :to="article.slug">{{ article.title }}</router-link>
			<div class="inj-recent__author">by {{ article.author }}</div>
		</li>
	</ul>
</div>
</template>

<script>
import axios from 'axios';
import constants from '../constants';

export default {
	name: 'RecentArticles',
	data: function () {
		return {
			recentArticles: [],
			serverError: '',
		}
	},
	mounted() {
		let apiUrl = constants.API_BASE_URL + constants.API_PATH + 'recent/';
		let self = this;
		
		axios.get(apiUrl)
			.then((response) => {
				// handle success
				self.recentArticles = response.data;
			})
			.catch((error) => {
				// TODO: show general server error message page
				console.log('recent article call failed');
				console.log(error);
				self.serverError = error;
			});	
	}
}
</script>

<style lang="scss">
@import '../settings.scss';

.inj-recent__author {
	font-size: 11pt;
	font-style: italic;
	line-height: 1;
	padding-bottom: $spacing;
}
</style>