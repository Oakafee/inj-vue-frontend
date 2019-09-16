<template>
	<div class="inj-article">
		<div class="inj-article__content">
			<ArticleMap :feature="mapFeature" />
			<div class="inj-article__title-area">
				<h4>Breadcrumbs </h4>
				<h1>{{ articleInfo.title }} </h1>
				<h3 v-if="articleInfo.subtitle">{{ articleInfo.subtitle }} </h3>
				<h4>By {{ articleInfo.contributor }} </h4>
			</div>
			<p v-html="articleInfo.article_content"></p>
		</div>
	</div>
</template>

<script>
import axios from 'axios';

import constants from '../constants';

import ArticleMap from './ArticleMap';

export default {
	name: 'Article',
	components: {
		ArticleMap
	},
	props: {
		msg: String,
	},
	data() {
		return {
			slug: '',
			articleInfo: {},
			mapFeature: {},
		}
	},
	mounted() {
		this.slug = this.$route.params.slug;
		this.getArticleInfo();	
	},
	beforeRouteUpdate (to, from, next) {
		this.slug = to.params.slug;
		this.getArticleInfo();
		next();
	},
	methods: {
		getArticleInfo() {
			let apiUrl = constants.API_BASE_URL + constants.API_PATH + this.slug + '/';
			let self = this;
		
			axios.get(apiUrl)
				.then(function (response) {
					// handle success
					self.articleInfo = response.data;
					if (self.articleInfo.geo_coordinates) {
						self.structureGeoJsonForMap();
					} else {
						self.mapFeature = {};
					}
				})
				.catch(function (error) {
					// handle error
					self.$router.push({ name: '404' });
					return error;
				});
		},
		structureGeoJsonForMap() {
			this.mapFeature = {
				'type': 'Feature',
				'properties': {
					'name': this.articleInfo.title,
					'category': this.articleInfo.geo_category
				},
				'geometry': {
					'type': this.articleInfo.geo_type,
					'coordinates': JSON.parse(this.articleInfo.geo_coordinates)
				}
			};	
		},
	}
}
</script>

<style lang="scss">
@import '../settings.scss';

.inj-article {
	flex: 3 0 0; // changed from 5 0 0
	padding: $spacing;
	@media (min-width: $media-break) {
		padding: 2 * $spacing;
	}
	&__content {
		max-width: 600px;
		margin: 0 auto;
	}
	&__title-area {
		text-align: center;
	}
}
	
</style>