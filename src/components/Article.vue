<template>
	<div class="inj-article">
		<div class="inj-article__content" v-if="articleDetail.pk">
			<ArticleMap :editable="editable" />
			<div v-if="editPermission" class="inj-article__edit-button">
				<button v-if="editable" class="inj-button inj-button-secondary" @click="cancelEditing()">Cancel Editing </button>
				<button v-else class="inj-button" @click="editArticle()">Edit Article </button>
			</div>
			
			<div class="inj-article__title-area">
				<!-- <ArticleBreadcrumbs /> Having issue with excess recursion -->
				<h1>{{ articleDetail.title }}</h1>
				<h3 v-if="articleDetail.subtitle">{{ articleDetail.subtitle }} </h3>
				<h4>By {{ articleDetail.author }} - {{ formattedPubDate }}</h4>
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
				<p v-html="articleDetail.article_content"></p>
			</div>		
			<ArticleComments :articlePk="articleDetail.pk" :articleEdit="editableArticle" />
			<ArticleChildren />
		</div>
		<div v-else>Loading... </div>
		<InjModal v-if="deleteModalOpen">
			<p>Are you sure you want to delete the article {{ articleDetail.title }}? </p>
			<div class="inj-article__edit-button">
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
			newMapFeature: 'newMapFeature',
		}),
		formattedPubDate() {
			let pubDate = new Date(this.articleDetail.pub_date);
			return pubDate.toLocaleString('default', constants.DATE_FORMAT);
		},
		editable() {
			return this.editableArticle === this.articleDetail.slug;
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
			store.commit('addNewMapFeature', {});
		},
		submitChanges() {
			// validation
			if (this.editedContent) this.sendChangedInfo()
			else this.validationError = 'Please submit something';
		},
		sendChangedInfo() {
			let apiUrl = constants.API_BASE_URL + constants.API_PATH + this.slug + '/';
			let serializedChanges = {};
			let self = this;

			if (this.newMapFeature.geometry) {
				serializedChanges = functions.destructureGeoJsonForDb(this.newMapFeature);
			}
			serializedChanges.article_content = this.editedContent;
			axios.patch(apiUrl, serializedChanges)
				.then((response) => {
					// handle success
					store.commit('getArticleDetail', response.data);
					store.commit('editArticle', null);
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
					store.commit('getArticleDetail', {});
					store.commit('editArticle', null);
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
		justify-content: right; //changed from space-between
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