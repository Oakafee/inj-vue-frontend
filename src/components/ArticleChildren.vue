<template>
<ul v-if="childrenArticlesList.length > 0"><h3>Children articles: </h3>
	<li v-for="article in childrenArticlesList">
		<router-link :to="article.slug">{{ article.title }}</router-link>
	</li>
</ul>
</template>

<script>
import { mapState } from 'vuex';

export default {
	name: 'ArticleChildren',
	computed: {
		...mapState({
			articles: 'articleList',
			articleDetail: 'articleDetail',
		}),
		childrenArticlesList() {
			let childrenArticlesList = [];
			
			if (this.articles) {
				for (let i=0; i<this.articles.length; i++) {
					let art = this.articles[i];
					if (art.parent === this.articleDetail.pk) {
						childrenArticlesList.push(art);
					}
				}
			}
			return childrenArticlesList;
		},
	},
}
</script>

<style lang="scss">
	
</style>