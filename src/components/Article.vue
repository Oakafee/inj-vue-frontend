<template>
	<div class="inj-article">
	<ArticleMap :editable="editable" :editPermission="editPermission" />
		<div class="inj-article__content" v-if="articleDetail.pk">
			<div class="inj-article__title-area">
				<ArticleBreadcrumbs />
				<h1>{{ articleDetail.title }}</h1>
				<h3 v-if="articleDetail.subtitle">{{ articleDetail.subtitle }} </h3>
				<h4>By {{ articleDetail.author }} - {{ formattedPubDate }}</h4>
			</div>
			<div v-if="editable" class="inj-article__edit-content">
				<textarea class="inj-textarea" :class="{ 'inj-textarea-error' : validationError }" v-model="editedContent" />
				<div class="inj-article__choose-html">
				<label for="htmlTags">
					<input type="checkbox" id="htmlTags" v-model="htmlTags">
					HTML tags used
				</label>
				</div>
			</div>
			<div v-else>
				<div
					v-if="articleDetail.html_safe"
					v-html="articleDetail.article_content"
				></div>
				<div
					v-else
					class="inj-article__plain-text">
					<p>{{ articleDetail.article_content }}</p>
				</div>
			</div>
			
			<div v-if="editPermission" class="inj-article__edit-button-row">
				<div class="inj-button-row">
					<span v-if="editable">
						<!-- TODO: add transition -->
						<button class="inj-button inj-button-tertiary" @click="deleteModalOpen = true">Delete </button>
						<button class="inj-button inj-button-secondary" @click="cancelEditing()">Cancel Edits </button>
						<button class="inj-button" :class="{ 'inj-button-error' : validationError }" @click="submitChanges()">Submit </button>
						<span class="inj-text-error" v-if="validationError">{{ validationError }}  </span>
					</span>
					<span v-else>
						<router-link :to="{ name: 'new-article', params: {parent: articleDetail.pk } }">+ Add Child Article</router-link>&nbsp;
						<button class="inj-button inj-button-secondary" @click="editArticle()">Edit Article </button>
					</span>
				</div>
			</div>
			<ArticleComments :articlePk="articleDetail.pk" :articleEdit="editableArticle" />
			<ArticleChildren />
		</div>
		<div v-else>Loading... </div>
		<InjModal v-if="deleteModalOpen">
			<p>Are you sure you want to delete the article "{{ articleDetail.title }}?" </p>
			<div class="inj-button-row">
				<button class="inj-button inj-button-secondary" @click="deleteModalOpen = false">No </button>
				<button class="inj-button inj-button-tertiary" @click="deleteArticle()">Yes </button>
			</div>
		</InjModal>
	</div>
</template>

<script>
import axios from 'axios';
import {mapState} from 'vuex';

import store from '../store';
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
			htmlTags: false,
			validationError: null,
			deleteModalOpen: false,
		}
	},
	mounted() {
		// this fires when you load the page
		this.slug = this.$route.params.slug;
		functions.getArticleDetails(this.slug);
	},
	beforeRouteUpdate (to, from, next) {
		// this fires when the route changes without rerendering the component
		this.slug = to.params.slug;
		
		this.validationError = null;
		
		next();
		functions.getArticleDetails(this.slug);
	},
	computed: {
		...mapState([
			'articleDetail',
			'editableArticle',
			'articleMapFeature',
			'newMapFeature',
			'mapFeaturesList',
			'mapEditInProgress',
			'editInProgress',
			'authToken',
			'user'
		]),
		formattedPubDate() {
			let pubDate = new Date(this.articleDetail.pub_date);
			return pubDate.toLocaleString('default', constants.DATE_FORMAT);
		},
		editPermission() {
			return this.articleDetail.contributor === this.user.id;
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
		},
		inProgress() {
			return (this.mapEditInProgress || this.newMapFeature.geometry || (this.editable && (this.articleDetail.article_content !== this.editedContent)))
		}
	},
	watch: {
		inProgress() { functions.editInProgress(this.inProgress) }
	},
	methods: {
		editArticle() {
			this.editedContent = this.articleDetail.article_content;
			this.htmlTags = this.articleDetail.html_safe;
			/*if(this.articleMapFeature.geometry) {
				// this may come back to haunt me? Yes, I think it was a cheap way of triggering the newMapFeature watcher ArticleMap.vue in order to get certain functions to run
				store.commit('addNewMapFeature', this.articleMapFeature);
			}*/
			store.commit('editArticle', this.articleDetail.slug);
		},
		cancelEditing() {
			this.editedContent = null;
			this.validationError = null;
			this.htmlTags = this.articleDetail.html_safe;
			store.commit('editArticle', null);
			if (this.newMapFeature.geometry) {
				store.commit('addNewMapFeature', { 'cancelEditing': true });
				// Can't commit an empty feature because that would be what would show up on the map. 
			}

		},
		submitChanges() {
			// validation
			if (this.mapEditInProgress) {
				this.validationError = 'Please save or cancel your map changes before submitting.'
			} else if (!this.editedContent) {
				this.validationError = 'It seems like you deleted all of the content of the article. To delete the article please use the delete button instead.';
			} else this.sendChangedInfo();
			// TODO: add scrolling to top on successful submit
		},
		sendChangedInfo() {
			let apiUrl = constants.API_BASE_URL + constants.API_PATH + this.slug + '/';
			let serializedChanges = {};
			let self = this;
			
			// added first condition, because even if you delete the feature, newMapFeature should still have geometry
			if (this.newMapFeature.geometry && this.articleMapFeature !== this.newMapFeature) {
			// second condition: if you cancel edits, newMapFeature is assigned the value of articleMapFeature, so it will update and display
				serializedChanges = functions.destructureGeoJsonForDb(this.newMapFeature);
			}
			
			if (this.articleDetail.article_content !== this.editedContent) {
			// if the text of the article was changed in any way
				serializedChanges.article_content = this.editedContent;
			}
			
			if (this.articleDetail.html_safe !== this.htmlTags) {
				serializedChanges.html_safe = this.htmlTags;			
			}
			
			if (Object.keys(serializedChanges).length === 0) {
				this.validationError = 'No changes detected';
				return;
			}
			axios({
				method: 'patch',
				url: apiUrl,
				headers: functions.authHeader(self.authToken),
				data: serializedChanges
			})
			.then((response) => {
				// handle success
				// update geo info on HomeMap
				self.updateMapFeatureInList(response.data);
				functions.resetMapFeature(response.data, self.newMapFeature);
				//functions.clearNewMapFeature(self.newMapFeature);
				//store.commit('getArticleDetail', response.data);
				//store.commit('editArticle', null);
				self.editedContent = null;
				self.validationError = null;
			})
			.catch((error) => {
				// handle error
				self.validationError = 'server error: ' + error;
			});
		},
		deleteArticle() {
			let apiUrl = constants.API_BASE_URL + constants.API_PATH + this.slug + '/';
			let self = this;

			axios({
				method: 'delete',
				url: apiUrl,
				headers: functions.authHeader(self.authToken),
			})
			.then(() => {
				// handle success
				if (this.articleMapFeature.geometry && this.mapFeaturesList.features) {
					store.commit('removeMapFeatureFromList', this.articleMapFeature)	
				}
				functions.resetMapFeature({}, this.newMapFeature);
				self.$router.push({ name: 'home' });
			})
			.catch((error) => {
				self.validationError = 'server error with delete: ' + error;
				return error;
			});
				
			this.deleteModalOpen = false;
		},
		updateMapFeatureInList(data) {
			// this is for the homepage map
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
		left: 0;
		bottom: 0;
		width: calc(100% - 10px);
		padding: $spacing / 2;
		background: $color-secondary;
		display: flex;
		justify-content: center;
		z-index: 1001;
	}
	&__content {
		max-width: $article-content-width;
		margin: 0 auto 4*$spacing auto;
	}
	&__edit-content {
		margin-bottom: 4 * $spacing;
		.inj-textarea {
			height: 300px;
		}
	}
	&__plain-text {
		white-space: pre-line;
	}
	&__choose-html {
		text-align: right;
	}
	&__title-area {
		text-align: center;
	}
}
	
</style>