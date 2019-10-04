<template>
<div class="inj-article__breadcrumbs" v-if="articleDetail.parent">
	<span v-for="article in parentTree" :key="article.pk">
		<router-link :to="article.slug">{{ article.title }}</router-link>
		&nbsp;->&nbsp;
	</span>
</div>
</template>

<script>
import { mapState } from 'vuex';

export default {
	name: 'ArticleBreadcrumbs',
	computed: {
		...mapState({
			articles: 'articleList',
			articleDetail: 'articleDetail',
		}),
		parentTree() {
			let parentList = [];
			
			function nextLevelParent(pk, cumulativeParentList, articleList) {				
				let nextParent = {};
				
				if (!articleList) return null;
				
				for (let i=0; i<articleList.length; i++) {
					let art = articleList[i];
					if (art.pk === pk) {
						nextParent = {
							'pk': art.pk,
							'slug': art.slug,
							'title': art.title,
							'parent': art.parent,
							'main_cat': art.main_cat
						}
						break;
					}
				}
				// if the article has a parent or if it's one of the main categories
				if (nextParent.pk) {
					cumulativeParentList.push(nextParent);
					if (nextParent.parent) {
						nextLevelParent(nextParent.parent, cumulativeParentList, articleList);
					}
				}
				return cumulativeParentList;
			}
			
			parentList = nextLevelParent(this.articleDetail.parent, parentList, this.articles);
			if (parentList) {
				parentList = parentList.reverse();
			}
			return parentList;
		}
	},
}
</script>

<style lang="scss">
	
</style>
