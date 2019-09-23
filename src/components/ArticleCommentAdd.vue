<template>
	<div class="inj-article-comment-add">
		<input class="inj-article-comment-add__title inj-text-input" :class="{ 'inj-text-input-error' : validationError }" type="text" v-model="comTitle" placeholder="Add Comment Title" />
		<textarea class="inj-article-comment-add__content inj-textarea" v-model="comContent" :class="{ 'inj-textarea-error' : validationError }" placeholder="Add Your Thoughts..." />
		<span class="inj-text-error" v-if="validationError">{{ validationError }} </span>
		<button class="inj-button" :class="{ 'inj-button-error' : validationError }" @click="addComment()">Add your interpretation </button>
	</div>
</template>

<script>
import axios from 'axios';

import constants from '../constants';

export default {
	name: 'ArticleCommentAdd',
	props: [ 'articlePk' ],
	data: function () {
		return {
			comTitle: '',
			comContent: '',
			validationError: null,
		}
	},
	methods: {
		addComment() {
			if(this.comTitle && this.comContent) this.sendCommentInfo()
			else this.validationError = 'Please make sure all the fields are filled out';
		},
		sendCommentInfo() {
			let serializedComment = {};
			serializedComment = {
				'com_title': this.comTitle,
				'com_author': 'Jesse Fried',
				'commentary': this.comContent,
				'article': this.articlePk,
			};
			// including this.articlePk in the request url isn't really necessary, it's just that I'm using the same Django REST class-based view for both retrieving an article's comments and adding new comments, the ListCreateAPIView
			let apiUrl = constants.API_BASE_URL + 'commentary/' + this.articlePk + '/';
			let self = this;

			axios.post(apiUrl, serializedComment)
				.then((response) => {
					self.$emit(('show-new-comment'), response.data);
					self.comTitle = '';
					self.comContent = '';
					self.validationError = null;
				})
				.catch((error) => {
					self.validationError = 'server error: ' + error;
				});
		},
	},
}
</script>

<style lang="scss">
@import '../settings.scss';

.inj-article-comment-add {
	text-align: right;
	&__title {
		width: calc(100% - 10px);
		margin-bottom: 2 * $spacing;
	}
	&__content {
		margin-bottom: 2 * $spacing;
		height: 150px;
	}
}
</style>