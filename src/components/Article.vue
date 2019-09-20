<template>
	<div class="inj-article">
		<div class="inj-article__content">
			<ArticleMap :feature="mapFeature" />
			
			<div v-if="editPermission" class="inj-article__edit-button">
				<span>Breadcrumbs </span>
				<button v-if="editable" class="inj-button inj-button-secondary" @click="cancelEditing()">Cancel Editing </button>
				<button v-else class="inj-button" @click="editArticle()">Edit Article </button>
			</div>
			
			<div class="inj-article__title-area">
				<h1>{{ articleInfo.title }}</h1>
				<h3 v-if="articleInfo.subtitle">{{ articleInfo.subtitle }} </h3>
				<h4>By {{ articleInfo.author }} - {{ formattedPubDate }}</h4>
			</div>
			<p v-if="!editable" v-html="articleInfo.article_content"></p>
			<textarea v-if="editable" class="inj-article__edit-content inj-textarea" v-model="editedContent" />
			
			<div v-if="editable" class="inj-article__edit-button">
				<button class="inj-button inj-button-tertiary" @click="deleteArticle()">Delete Article </button>
				<button class="inj-button inj-button-secondary" @click="cancelEditing()">Cancel Editing </button>
				<button class="inj-button" @click="submitChanges()">Submit Changes </button>
			</div>
			
			<ArticleComments :articlePk="articleInfo.pk" :articleEdit="editableArticle" />
		</div>
	</div>
</template>

<script>
import axios from 'axios';

import constants from '../constants';

import ArticleMap from './ArticleMap';
import ArticleComments from './ArticleComments';

export default {
	name: 'Article',
	components: {
		ArticleMap,
		ArticleComments
	},
	data() {
		return {
			slug: '',
			articleInfo: {},
			mapFeature: {},
			commentaryInfo: {},
			editPermission: true,
			editableArticle: null,
			editedContent: null,
		}
	},
	mounted() {
		// this fires when you load the page
		this.slug = this.$route.params.slug;
		this.getArticleInfo();	
	},
	beforeRouteUpdate (to, from, next) {
		// this fires when the route changes without rerendering the component
		this.slug = to.params.slug;
		this.getArticleInfo();
		next();
	},
	computed: {
		formattedPubDate() {
			let pubDate = new Date(this.articleInfo.pub_date);
			return pubDate.toLocaleString('default', constants.DATE_FORMAT);
		},
		editable() {
			return this.editableArticle === this.articleInfo.slug;
		}
	},
	methods: {
		getArticleInfo() {
			let apiUrl = constants.API_BASE_URL + constants.API_PATH + this.slug + '/';
			let self = this;
		
			axios.get(apiUrl)
				.then((response) => {
					// handle success
					self.articleInfo = response.data;
					if (self.articleInfo.geo_coordinates) {
						self.structureGeoJsonForMap();
					} else {
						self.mapFeature = {};
					}
				})
				.catch((error) => {
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
		editArticle() {
			this.editedContent = this.articleInfo.article_content;
			this.editableArticle = this.articleInfo.slug;
		},
		cancelEditing() {
			this.editedContent = null;
			this.editableArticle = null;
		},
		submitChanges() {
			let apiUrl = constants.API_BASE_URL + constants.API_PATH + this.slug + '/';
			let serializedChanges = {};
			serializedChanges = {
				'article_content': this.editedContent,
			};
			let self = this;
		
			axios.patch(apiUrl, serializedChanges)
				.then((response) => {
					// handle success
					console.log('successfully changed article', response.data);
				})
				.catch((error) => {
					// handle error
					console.log('failed to change article', error);
					return error;
				});
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
	&__edit-button {
		display: flex;
		justify-content: space-between;
	}
	&__content {
		max-width: 600px;
		margin: 0 auto;
	}
	&__edit-content {
		height: 300px;
		margin-bottom: 2 * $spacing;
	}
	&__title-area {
		text-align: center;
	}
}
	
</style>