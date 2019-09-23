<template>
	<div class="inj-article">
		<div class="inj-article__content" :class="{ 'inj-article__content--show' : articleInfo.pk }">
			<ArticleMap :feature="mapFeature" />
			
			<div v-if="editPermission" class="inj-article__edit-button">
				<span>Som'n </span>
				<button v-if="editable" class="inj-button inj-button-secondary" @click="cancelEditing()">Cancel Editing </button>
				<button v-else class="inj-button" @click="editArticle()">Edit Article </button>
			</div>
			
			<div class="inj-article__title-area">
				<ArticleBreadcrumbs :articlePk="articleInfo.pk" />
				<h1>{{ articleInfo.title }}</h1>
				<h3 v-if="articleInfo.subtitle">{{ articleInfo.subtitle }} </h3>
				<h4>By {{ articleInfo.author }} - {{ formattedPubDate }}</h4>
			</div>
			<div v-if="editable">
				<textarea class="inj-article__edit-content inj-textarea" :class="{ 'inj-textarea-error' : validationError }" v-model="editedContent" />			
				<span class="inj-text-error" v-if="validationError">{{ validationError }}  </span>
				<div class="inj-article__edit-button">
					<button class="inj-button inj-button-tertiary" @click="deleteModalOpen = true">Delete Article </button>
					<button class="inj-button inj-button-secondary" @click="cancelEditing()">Cancel Editing </button>
					<button class="inj-button" :class="{ 'inj-button-error' : validationError }" @click="submitChanges()">Submit Changes </button>
				</div>
			</div>
			<div v-else>
				<p v-html="articleInfo.article_content"></p>
			</div>		
			<ArticleComments :articlePk="articleInfo.pk" :articleEdit="editableArticle" />
			<ArticleChildren :articlePk="articleInfo.pk" />
		</div>
		<InjModal v-if="deleteModalOpen">
			<p>Are you sure you want to delete the article {{ articleInfo.title }}? </p>
			<div class="inj-article__edit-button">
				<button class="inj-button inj-button-secondary" @click="deleteModalOpen = false">No </button>
				<button class="inj-button inj-button-tertiary" @click="deleteArticle()">Yes </button>
			</div>
		<div v-if="!articleInfo.pk">Loading...</div>
		</InjModal>
	</div>
</template>

<script>
import axios from 'axios';

import constants from '../constants';
import functions from '../functions';

import ArticleMap from './ArticleMap';
import ArticleBreadcrumbs from './ArticleBreadcrumbs';
import ArticleComments from './ArticleComments';
import ArticleChildren from './ArticleChildren';
import InjModal from './InjModal';

export default {
	name: 'Article',
	components: {
		ArticleMap,
		ArticleBreadcrumbs,
		ArticleComments,
		ArticleChildren,
		InjModal
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
			validationError: null,
			deleteModalOpen: false,
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
		next();
		this.articleInfo = {};
		this.getArticleInfo();
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
			// validation
			if (this.editedContent) this.sendChangedInfo()
			else this.validationError = 'Please submit something';
		},
		sendChangedInfo() {
			let apiUrl = constants.API_BASE_URL + constants.API_PATH + this.slug + '/';
			let serializedChanges = {};
			serializedChanges = {
				'article_content': this.editedContent,
			};
			let self = this;
		
			axios.patch(apiUrl, serializedChanges)
				.then((response) => {
					// handle success
					self.articleInfo = response.data
					self.editableArticle = null;
					self.editedContent = null;
					self.validationError = null;
				})
				.catch((error) => {
					// handle error
					self.validationError = 'server error: ' + error;
					return error;
				});
		},
		deleteArticle() {
			let apiUrl = constants.API_BASE_URL + constants.API_PATH + this.slug + '/';
			let self = this;
		
			axios.delete(apiUrl)
				.then((response) => {
					// handle success
					functions.getArticleList();
					self.$router.push({ name: 'home' });
				})
				.catch((error) => {
					self.validationError = 'server error with delete: ' + error;
					return error;
				});
				
			this.deleteModalOpen = false;
		}
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
		visibility: hidden;
		opacity: 0;
		transition: opacity $transition-time;
		&.inj-article__content--show {
			visibility: visible;
			opacity: 1;
		}
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