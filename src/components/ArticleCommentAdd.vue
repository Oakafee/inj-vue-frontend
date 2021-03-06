<template>
	<div>
		<hr class="inj-article-comments__break" />
		<form
			v-if="user.id"
			class="inj-article-comment-add"
			@submit.prevent="addComment()"
		>
			<input class="inj-article-comment-add__title inj-text-input" :class="{ 'inj-text-input-error' : validationError }" type="text" v-model="comTitle" placeholder="Add Comment Title" />
			<textarea class="inj-article-comment-add__content inj-textarea" v-model="comContent" :class="{ 'inj-textarea-error' : validationError }" placeholder="Add Your Thoughts..." />
			<span class="inj-text-error" v-if="validationError">{{ validationError }} </span>
			<input
				type="submit"
				class="inj-button"
				:class="{ 'inj-button-error' : validationError }"
				value="Add your interpretation"
			/>
		</form>
		<p v-else class="inj-article-comment-add__logged-out">{{ loggedOutText }} </p>
	</div>
</template>

<script>
import axios from 'axios';
import {mapState} from 'vuex';

import functions from '../functions';
import constants from '../constants';

export default {
	name: 'ArticleCommentAdd',
	data: function () {
		return {
			comTitle: '',
			comContent: '',
			validationError: null,
			loggedOutText: constants.LOG_IN_TO_COMMENT
		}
	},
	computed: {
		...mapState([
			'articleDetail',
			'authToken',
			'user'
		]),
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
				'com_contributor_id': this.user.id,
				'commentary': this.comContent,
				'article_id': this.articleDetail.pk,
			};
			// including this.articlePk in the request url isn't really necessary, it's just that I'm using the same Django REST class-based view for both retrieving an article's comments and adding new comments, the ListCreateAPIView
			let apiUrl = `${constants.API_BASE_URL}commentary/${this.articleDetail.pk}/`;
			let self = this;

			axios({
				method: 'post',
				url: apiUrl,
				headers: functions.authHeader(self.authToken),
				data: serializedComment
			})
			.then(() => {
				functions.getCommentary(self.articleDetail.pk);
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
	padding-top: $spacing;
	&__title {
		width: calc(100% - 10px);
		margin-bottom: 2 * $spacing;
	}
	&__content {
		margin-bottom: 2 * $spacing;
		height: 150px;
	}
	&__logged-out {
		font-style: italic;	
	}
}
</style>