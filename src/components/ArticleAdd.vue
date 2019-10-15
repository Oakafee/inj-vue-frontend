<template>
<div class="inj-article">
<div class="inj-article__content">
<h1 class="inj-article__title-area">Add New Article </h1>
<p>Please add your own new interpretive article, from your own personal perspective. </p>
<ArticleMap :editable="mapEditable" class="inj-add__form-element" />
<form id="injAddArticle">
	<input
		type="text"
		class="inj-text-input inj-add__form-element"
		:class="{ 'inj-text-input-error' : validationError.field === 'title' }"
		placeholder="Title*"
		v-model="newTitle"
	/>
	<input
		type="text"
		class="inj-text-input inj-add__form-element"
		placeholder="Subtitle"
		v-model="newSubtitle"
	/>
	<div class="inj-add__form-element">
		<label for="selectParent">Parent: </label>
		<select 
			class="inj-select"
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
		class="inj-textarea inj-add__form-element inj-add__content"
		:class="{ 'inj-textarea-error' : validationError.field === 'content' }"
		placeholder="Add your interpretation*" 
		v-model="newContent"
	/>
	<p class="inj-text-error" v-if="validationError.message">{{ validationError.message }}  </p>
	<input
		type="submit"
		class="inj-button"
		:class="{ 'inj-button-error' : validationError.message }"
		@click="submitNewArticleForm()"
	/>
</form>
	
</div>
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
			newParent: this.$route.params.parent ? this.$route.params.parent : null,
			newContent: '',
			mapEditable: false,
			validationError: {
				"field": "",
				"message": "",
			},
		}
	},
	computed: {
		...mapState({
			articleList: 'articleList',
			mapFeaturesList: 'mapFeaturesList',
			newMapFeature: 'newMapFeature',
		}),
	},
	mounted() {
		// shouldn't have to do this
		functions.getGeoCategories();
		// or this
		this.mapEditable = true;
	},
	methods: {
		selectParent(event) {
			this.newParent = event.target.value;
		},
		submitNewArticleForm() {
			if (this.articleIsValid()) this.postNewArticle();
		},
		articleIsValid() {
			if(!this.newTitle) {
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
				"author": "Jesse Fried",
				"contributor": 1,
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
			
			axios.post(apiUrl, serializedArticle)
				.then((response) => {
					// handle success
					//store.commit('getArticleDetail', response.data);
					store.commit('addArticleToList', response.data);
					console.log('create article', response.data);
					// should I check for mapFeaturesList.features here or in the store?
					if (response.data.geo_coordinates && this.mapFeaturesList.features) {
						let newFeature = functions.structureGeoJsonForMap(response.data);
						store.commit('addMapFeatureToList', newFeature);
					}
					self.validationError = null;
					self.$router.push(response.data.slug);
				})
				.catch((error) => {
					// handle error
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
	&__form-element {
		display: block;
		width: 100%;
		margin-bottom: 2 * $spacing;
	}
	&__content {
		height: 300px;
	}
}
</style>