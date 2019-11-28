<template>
<div class="inj-article-comments">
	<div v-for="comment in commentary" :key="comment.pk">
		<hr class="inj-article-comments__break" />
		<div class="inj-article-comments__content">
			<h3>{{ comment.com_title }} </h3>
			<span class="inj-article-comments__contributor">
				<router-link
					:to="`/contributor/${comment.com_contributor.username}`"
				>{{ commentContributorName(comment) }}</router-link> 
					- {{ comment.pub_date.substring(0,10) }}
				<ArticleCommentDelete
					:comment="comment"
					v-if="comment.com_contributor.id === user.id"
				/>
			</span>
			<p>{{ comment.commentary }} </p>
		</div>
	</div>
	<ArticleCommentAdd class="inj-article-comments__content" v-if="!editableArticle" />
</div>
</template>

<script>
import {mapState} from 'vuex';

import ArticleCommentAdd from './ArticleCommentAdd';
import ArticleCommentDelete from './ArticleCommentDelete';

export default {
	name: 'ArticleComments',
	components: {
		ArticleCommentAdd,
		ArticleCommentDelete
	},
	computed: {
		...mapState({
			commentary: 'articleCommentary',
			editableArticle: 'editableArticle',
			user: 'user'
		}),
	},
	methods: {
		commentContributorName(comment) {
			return `${comment.com_contributor.first_name} ${comment.com_contributor.last_name}`
		},
	}
}
</script>

<style lang="scss">
@import '../settings.scss';

.inj-article-comments {
	&__contributor, &__delete {
		display: inline;
	}
	&__content {
		margin: $spacing 0;
	}
	&__break {
		width: 33%;
	}
}	
</style>