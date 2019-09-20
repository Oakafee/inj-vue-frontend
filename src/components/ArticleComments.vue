<template>
<div class="inj-article-comments">
	<div v-for="comment in commentaryInfo" :key="comment.pk">
		<hr class="inj-article-comments__break" />
		<div class="inj-article-comments__content">
			<h3>{{ comment.com_title }} </h3>
			<h4>{{ comment.com_author }} - {{ comment.pub_date.substring(0,10) }} </h4>
			<p>{{ comment.commentary }} </p>
		</div>
	</div>
	<ArticleCommentAdd :articlePk="articlePk" class="inj-article-comments__content" v-if="!articleEdit" v-on:show-new-comment="showNewComment($event)" />
</div>
</template>

<script>
import axios from 'axios';

import constants from '../constants';

import ArticleCommentAdd from './ArticleCommentAdd';

export default {
	name: 'ArticleComments',
	props: [ 'articlePk', 'articleEdit' ],
	components: {
		ArticleCommentAdd,
	},
	data: function () {
		return {
			commentaryInfo: {},
		}
	},
	watch: {
		articlePk() {
			this.getCommentaryInfo();
		}
	},
	methods: {
		getCommentaryInfo() {
			let apiUrl = constants.API_BASE_URL + 'commentary/' + this.articlePk + '/';
			let self = this;
		
			axios.get(apiUrl)
				.then(function (response) {
					// handle success
					self.commentaryInfo = response.data
				})
				.catch(function (error) {
					// handle error
					self.commentaryInfo = 'sad, there was an error';
					return error;
				});
		},
		showNewComment(newComment) {
			this.commentaryInfo.push(newComment);
		}
	}
}
</script>

<style lang="scss">
@import '../settings.scss';

.inj-article-comments {
	&__content {
		margin: $spacing 0;
	}
	&__break {
		width: 33%;
	}
}	
</style>