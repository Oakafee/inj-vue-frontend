<template>
	<div class="tree-nav">
		<li class="tree-nav__article">
			<svg @click="showChildren = !showChildren" class="tree-nav__chevron" :class="{ 'tree-nav__chevron--open' : showChildren, 'tree-nav__chevron--show' : hasChildren }" viewBox="0 0 24 24" width="24" height="24" stroke-width="2" fill="none">
				<polyline points="9 18 15 12 9 6"></polyline>
			</svg>
			<router-link :to="parentArticle.slug">{{ parentArticle.title }}</router-link>
		</li>
		<ul v-for="child in childrenArticles" class="tree-nav__children" :class="{ 'tree-nav__children--show' : showChildren }" :key="child.pk">
			<TreeNav :parentArticle="child" :articles="articles" />
		</ul>
	</div>
</template>

<script>
import { mapState } from 'vuex';

import store from '../store';
import TreeNav from "./TreeNav";

export default {
	name: 'TreeNav',
	components: { TreeNav },
	props: ['parentArticle'],
	data: function () {
		return {
			showChildren: false,
		}
	},
	computed: {
		...mapState({
			articles: 'articleList',
		}),
		childrenArticles() {		
			let childrenArticles = [];
			
			if (this.articles) {
				childrenArticles = this.articles.filter(art =>
					art.parent === this.parentArticle.pk
				);
			}
			
			return childrenArticles;
		},
		hasChildren() {
			if (this.childrenArticles.length === 0) return false;
			return true;
		}
    },
    watch: {
    	$route() {
    		this.showChildren = false;
    	}
    }
}
</script>

<style lang="scss">
@import '../settings.scss';

.tree-nav {
	font-size: 15pt;
	&__chevron {
		cursor: pointer;
		transition: transform 0.2s;
		stroke: currentColor;
		vertical-align: top;
		visibility: hidden;
		position: absolute;
		left: -3 * $spacing;
		height: 3*$spacing;
		&--open {
			transform: rotate(0.25turn);
		}
		&--show {
			visibility: visible;	
		}
	}
	&__article {
		padding-bottom: $spacing;
		position: relative; //this is for the absolute positioning of the chevron
	}
	&__children {
		padding-left: 2 * $spacing;
		display: none;
		&--show {
			display: block;
		}
	}
}


</style>