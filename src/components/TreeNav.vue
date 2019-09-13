<template>
	<div class="tree-nav">
		<li @click="showChildren = !showChildren">{{ parentArticle.title }} </li>
		<ul v-for="child in childrenArticles" class="tree-nav__children" :class="{ 'tree-nav__children--show' : showChildren }" :key="child.pk">
			<TreeNav :parentArticle="child" :articles="articles" />
		</ul>
	</div>
</template>

<script>
import TreeNav from "./TreeNav";

export default {
	name: 'TreeNav',
	components: { TreeNav },
	props: ['parentArticle', 'articles'],
	data: function () {
		return {
			showChildren: false,
		}
	},
	computed: {
		childrenArticles() {
			let childrenArticles = [];
			for (let i=0; i<this.articles.length; i++) {
				if (this.articles[i].parent === this.parentArticle.pk) {
					childrenArticles.push(this.articles[i]);
				}
			}
			return childrenArticles;
		}
    }
	
}
</script>

<style lang="scss">
.tree-nav {
	list-style-type: none;
	&__children {
		display: none;
		&--show {
			display: block;
		}
	}
}


</style>