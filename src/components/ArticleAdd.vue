<template>
	<div class="inj-article">
		<div v-if="user.id" class="inj-article__content">
			<h1 class="inj__title-area">Add New Article </h1>
			<p>Please add your own new interpretive article, from your own personal perspective. </p>
			<ArticleMap :editable="mapEditable" class="inj-form-element" />
			<form id="injAddArticle">
				<input
					type="text"
					class="inj-text-input inj-text-input--full-width inj-form-element"
					:class="{ 'inj-text-input-error' : validationError.field === 'title' }"
					placeholder="Title*"
					v-model="newTitle"
				/>
				<input
					type="text"
					class="inj-text-input inj-text-input--full-width inj-form-element"
					placeholder="Subtitle"
					v-model="newSubtitle"
				/>
				<!--
				<input
					type="text"
					class="inj-text-input inj-text-input--full-width inj-form-element"
					:class="{ 'inj-text-input-error' : validationError.field === 'title' }"
					placeholder="Author*"
					v-model="newAuthor"
				/>
				-->
				<div class="inj-form-element">
					<label for="selectParent">Parent: </label>
					<select 
						class="inj-select inj-add__parent-select"
						:class="{ 'inj-select-error' : validationError.field === 'parent' }"
						id="selectParent"
						@input="selectParent"
					>
						<option value="null" disabled :selected="!newParent">Parent article: </option>
						<option
							v-for="parent in articleList"
							:value="parent.pk"
							:key="parent.pk"
							:selected="newParent === parent.pk"
						>
							{{ parent.title }}
						</option>
					</select>
				</div>
				<p>You can add plain text, or use HTML tags for formatting. </p>
				<textarea
					class="inj-textarea inj-form-element inj-add__content"
					:class="{ 'inj-textarea-error' : validationError.field === 'content' }"
					placeholder="Add your interpretation*" 
					v-model="newContent"
				/>
				<p class="inj-text-error" v-if="validationError.message">{{ validationError.message }}  </p>
				<div class="inj-form-submit-button">
					<span v-if="submitInProgress">Submitting article... </span>
					<input
						v-else
						type="submit"
						value="Add Article"
						class="inj-button"
						:class="{ 'inj-button--error' : validationError.message }"
						@click="submitNewArticleForm()"
					/>
				</div>
			</form>
	
		</div>
		<div v-else><p>To submit an article, please log in or sign up. </p></div>
	</div>
</template>

<script>
import axios from 'axios';
import {mapState} from 'vuex';

import store from '../store';
import functions from '../functions';
import constants from '../constants';
import ArticleMap from './ArticleMap';

export default {
	name: 'ArticleAdd',
	components: { ArticleMap },
	props: ['parent'],
	data() {
		return {
			newTitle: '',
			newSubtitle: '',
			newAuthor: '',
			newParent: this.$route.params.parent ? this.$route.params.parent : null,
			newContent: '',
			mapEditable: true,
			validationError: {
				"field": "",
				"message": "",
			},
			submitInProgress: false,
		}
	},
	computed: {
		...mapState([
			'articleList',
			'mapFeaturesList',
			'articleMapFeature',
			'newMapFeature',
			'mapEditInProgress',
			'authToken',
			'user'
		]),
		inProgress() {
			return (this.mapEditInProgress || this.newMapFeature.geometry || this.newTitle || this.newSubtitle || this.newAuthor || this.newContent)
		}
	},
	watch: {
		inProgress() { functions.editInProgress(this.inProgress) }
	},
	mounted() {
		// not 100% sure about this condition
		if (this.articleMapFeature.geometry) {
			store.commit('getArticleDetail', {});
		}
	},
	methods: {
		selectParent(event) {
			this.newParent = event.target.value;
		},
		submitNewArticleForm() {
			if (this.articleIsValid()) this.postNewArticle();
		},
		articleIsValid() {
			if (this.mapEditInProgress) {
				this.validationError.message = 'Please save or cancel your map changes before submitting.'
			} else if(!this.newTitle) {
				this.validationError.field = "title";
				this.validationError.message = "Title is required"
				return false;
			} else if (!this.newParent) {
				this.validationError.field = "parent";
				this.validationError.message = "Please select a parent article";
			} else if (!this.newContent) {
				this.validationError.field = "content"
				this.validationError.message = 'Please enter some content';
				return false;
			} else {
				this.validationError = {
					"field": "",
					"message": "",
				}
				return true;
			}
		},
		postNewArticle() {
			let apiUrl = constants.API_BASE_URL + constants.API_PATH + 'create/'
			let self = this;
			let serializedArticle = {};
			let serializedBasicArticle = {
				"title": this.newTitle,
				"subtitle": this.newSubtitle,
				"contributor_id": this.user.id,
				"article_content": this.newContent,
				"parent": this.newParent
			}
			if (this.newMapFeature.geometry && this.newMapFeature.geometry.coordinates) {
				serializedArticle = {
					...serializedBasicArticle,
					...functions.destructureGeoJsonForDb(this.newMapFeature)
				}
			} else {
				serializedArticle = serializedBasicArticle;
			}
			
			this.submitInProgress = true;
			axios({
				method: 'post',
				url: apiUrl,
				headers: functions.authHeader(self.authToken),
				data: serializedArticle
			})
			.then((response) => {
				// handle success
				self.submitInProgress = false;
				//store.commit('getArticleDetail', response.data);
				store.commit('addArticleToList', response.data);
				// should I check for mapFeaturesList.features here or in the store?
				if (response.data.geo_coordinates && this.mapFeaturesList.features) {
					let newFeature = functions.structureGeoJsonForMap(response.data);
					store.commit('addMapFeatureToList', newFeature);
				}
				if(self.newMapFeature.geometry) {
					store.commit('addNewMapFeature', {});
				}
				self.validationError = null;
				store.commit('editInProgress', false); //need to do this so the route change can happen
				self.$router.push(response.data.slug);
			})
			.catch((error) => {
				// handle error
				self.submitInProgress = false;
				console.log(error);
				if (error.response) {
					self.validationError.message = 'server error: ' + error.response.data.title;
				}
				return error;
			});
		}
	}
}
</script>

<style lang="scss">
@import '../settings.scss';

.inj-add {
	&__content {
		height: 300px;
	}
}
</style>