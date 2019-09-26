<template>
<div class="inj-article-comments">
	<div v-for="comment in commentary" :key="comment.pk">
		<hr class="inj-article-comments__break" />
		<div class="inj-article-comments__content">
			<h3>{{ comment.com_title }} </h3>
			<h4>{{ comment.com_author }} - {{ comment.pub_date.substring(0,10) }} </h4>
			<p>{{ comment.commentary }} </p>
		</div>
	</div>
	<ArticleCommentAdd class="inj-article-comments__content" v-if="!editableArticle" />
</div>
</template>

<script>
import {mapState} from 'vuex';

import ArticleCommentAdd from './ArticleCommentAdd';

export default {
	name: 'ArticleComments',
	components: {
		ArticleCommentAdd,
	},
	computed: {
		...mapState({
			commentary: 'articleCommentary',
			editableArticle: 'editableArticle',
		}),
	},
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