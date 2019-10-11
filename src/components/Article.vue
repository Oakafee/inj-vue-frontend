<template>
	<div class="inj-article">
		<div class="inj-article__content" v-if="articleDetail.pk">
			<ArticleMap :editable="editable" />
			<div class="inj-article__title-area">
				<ArticleBreadcrumbs />
				<h1>{{ articleDetail.title }}</h1>
				<h3 v-if="articleDetail.subtitle">{{ articleDetail.subtitle }} </h3>
				<h4>By {{ articleDetail.author }} - {{ formattedPubDate }}</h4>
			</div>
			<div v-if="editable">
				<textarea class="inj-article__edit-content inj-textarea" :class="{ 'inj-textarea-error' : validationError }" v-model="editedContent" />			
			</div>
			<div v-else class="inj-article__text">
				<p v-html="articleDetail.article_content"></p>
			</div>
			
			<div v-if="editPermission" class="inj-article__edit-button-row">
				<div v-if="editable">
					<!-- TODO: add transition -->
					<button class="inj-button inj-button-tertiary" @click="deleteModalOpen = true">Delete Article </button>
					<button class="inj-button inj-button-secondary" @click="cancelEditing()">Cancel Editing </button>
					<button class="inj-button" :class="{ 'inj-button-error' : validationError }" @click="submitChanges()">Submit Changes </button>
					<span class="inj-text-error" v-if="validationError">{{ validationError }}  </span>
				</div>
				<div v-else>
					<router-link :to="{ name: 'new-article', params: {parent: articleDetail.pk } }">+ Add Child Article</router-link>
					<button class="inj-button inj-button-secondary" @click="editArticle()">Edit Article </button>
				</div>
			</div>
			<ArticleComments :articlePk="articleDetail.pk" :articleEdit="editableArticle" />
			<ArticleChildren />
		</div>
		<div v-else>Loading... </div>
		<InjModal v-if="deleteModalOpen">
			<p>Are you sure you want to delete the article {{ articleDetail.title }}? </p>
			<div>
				<button class="inj-button inj-button-secondary" @click="deleteModalOpen = false">No </button>
				<button class="inj-button inj-button-tertiary" @click="deleteArticle()">Yes </button>
			</div>
		</InjModal>
	</div>
</template>

<script>
import axios from 'axios';
import {mapState} from 'vuex';

import store from '../store.js';
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
			editedContent: null,
			validationError: null,
			deleteModalOpen: false,
		}
	},
	mounted() {
		// this fires when you load the page
		this.slug = this.$route.params.slug;
		functions.getArticleDetails(this.slug);
	},
	destroyed() {
		store.commit('getArticleDetail', {});
	},
	beforeRouteUpdate (to, from, next) {
		// this fires when the route changes without rerendering the component
		this.slug = to.params.slug;
		next();
		functions.getArticleDetails(this.slug);
	},
	computed: {
		...mapState({
			articleDetail: 'articleDetail',
			editPermission: 'editPermission',
			editableArticle: 'editableArticle',
			articleMapFeature: 'articleMapFeature',
			newMapFeature: 'newMapFeature',
			mapFeaturesList: 'mapFeaturesList',
		}),
		formattedPubDate() {
			let pubDate = new Date(this.articleDetail.pub_date);
			return pubDate.toLocaleString('default', constants.DATE_FORMAT);
		},
		editable() {
			return this.editableArticle === this.articleDetail.slug;
		},
		newArticleRoute() {
			let pk = this.articleDetail.pk;
			return  {
				name: 'new-article',
				params: { parent: pk }
			}
		}
	},
	methods: {
		editArticle() {
			this.editedContent = this.articleDetail.article_content;
			store.commit('editArticle', this.articleDetail.slug);
		},
		cancelEditing() {
			this.editedContent = null;
			store.commit('editArticle', null);
			// replace the new map feature with an empty object
			store.commit('addNewMapFeature', this.articleMapFeature);
				// really should commit the value {}, but then how do you get articleMapFeature to re render without changing its value? My whole strategy is based on watchers in ArticleMap.vue that trigger functions local to that component. 

		},
		submitChanges() {
			// validation
			if (this.editedContent) this.sendChangedInfo()
			else this.validationError = 'It seems like you deleted all of the content of the article.';
			// TODO: add scrolling to top on successful submit
		},
		sendChangedInfo() {
			let apiUrl = constants.API_BASE_URL + constants.API_PATH + this.slug + '/';
			let serializedChanges = {};
			let self = this;
			
			if (this.articleMapFeature !== this.newMapFeature) {
			// if the map feature was changed in any way
				serializedChanges = functions.destructureGeoJsonForDb(this.newMapFeature);
			}
			
			if (this.articleDetail.article_content !== this.editedContent) {
			// if the text of the article was changed in any way
				serializedChanges.article_content = this.editedContent;
			}
			
			if (Object.keys(serializedChanges).length === 0) {
				this.validationError = 'No changes detected';
				return;
			}
			
			axios.patch(apiUrl, serializedChanges)
				.then((response) => {
					// handle success
					// update geo info on HomeMap
					self.updateMapFeatureInList(response.data);
					store.commit('getArticleDetail', response.data);
					store.commit('editArticle', null);
					self.editedContent = null;
					self.validationError = null;
				})
				.catch((error) => {
					// handle error
					self.validationError = 'server error: ' + error;
					console.log(error);
				});
		},
		deleteArticle() {
			let apiUrl = constants.API_BASE_URL + constants.API_PATH + this.slug + '/';
			let self = this;
		
			axios.delete(apiUrl)
				.then(() => {
					// handle success
					functions.getArticleList();
					self.$router.push({ name: 'home' });
					store.commit('getArticleDetail', {});
					store.commit('editArticle', null);
				})
				.catch((error) => {
					self.validationError = 'server error with delete: ' + error;
					return error;
				});
				
			this.deleteModalOpen = false;
		},
		updateMapFeatureInList(data) {
			if (!this.mapFeaturesList.features) return;
			let responseMapFeature = functions.structureGeoJsonForMap(data);
			if (responseMapFeature !== this.articleMapFeature) {
			// if map info on the article was changed
				if (this.articleMapFeature.geometry) {
				// if there is already a map feature that got...
					if(data.geo_coordinates) {
					// ...updated
						store.commit('replaceMapFeatureInList', responseMapFeature);
					} else {
					// ...deleted
						store.commit('removeMapFeatureFromList', this.articleMapFeature)
					}
				} else {
					//this condition is when a map feature is added for the first time
					store.commit('addMapFeatureToList', responseMapFeature);
				}
			}			
		}
	}
}
</script>

<style lang="scss">
@import '../settings.scss';

.inj-article {
	&__edit-button-row {
		position: fixed;
		bottom: 0;
		width: 100%;
		max-width: 600px;
		padding: $spacing;
		background: $color-secondary;
		display: flex;
		justify-content: right; //changed from space-between
		z-index: 1001;
		// Marina would kill me
		.inj-button {
			margin-left: $spacing;
		}
	}
	&__content {
		max-width: 600px;
		margin: 0 auto;
	}
	&__edit-content {
		height: 600px;
		margin-bottom: 4 * $spacing;
	}
	&__text {
		white-space: pre-line;
	}
	&__title-area {
		text-align: center;
	}
}
	
</style>