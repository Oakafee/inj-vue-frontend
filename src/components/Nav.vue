<template>
	<nav class="inj-nav" :class="{ 'inj-nav--mobile-open' : mobileNavOpen, 'inj-nav--show' : articleList, 'inj-nav--offset' : articleMapExpanded }">
		<div class="inj-nav__add"><router-link to="new-article">
			<button class="inj-button">+ Add Article</button>
		</router-link></div>
		<div class="inj-nav__tree">
			<div v-if="!articleList[0]">Loading...</div>
			<ul class="inj-nav__tree-cat" v-for="article in mainCatArticles" :key="article.pk">
				<TreeNav :parentArticle="article" />	
			</ul>
		</div>
		<FilterNav />
	</nav>
</template>

<script>
import { mapState } from 'vuex';

import functions from '../functions';
import store from '../store';

import TreeNav from './TreeNav';
import FilterNav from './FilterNav';

export default {
	name: 'Nav',
	components: { TreeNav, FilterNav },
	data: function () {
		return {
			// articles: '',
			// mainCatArticles: [],
		}
	},
	computed: {
		...mapState([
			'mobileNavOpen',
			'articleList',
			'articleMapExpanded'
		]),
		mainCatArticles() {
			let mains = [];
			
			if (!this.articleList) return mains;  			
			for(let i=0; i<this.articleList.length; i++) {
				if(this.articleList[i].main_cat) {
					mains.push(this.articleList[i])
				}
			}
			return mains;
		}
		
	},
	mounted() {
		functions.getArticleList();
	}
}
</script>

<style lang="scss">
@import '../settings.scss';

.inj-nav {
	background-color: $color-secondary;
	padding-top: 2 * $spacing;
	visibility: hidden;
	opacity: 0;
	transition-property: opacity, margin-top;
	transition-duration: $transition-time;
	@media(max-width: $media-break) {
		width: calc(100% - 24px); // to factor in the border and the padding on the container
		position: absolute;
		top: 63px;
		z-index: 9999;
		border-top: none;
		padding: $spacing;
	}
	&--mobile-open {
		visibility: visible;
		opacity: 1;
	}
	&--show {
		@media(min-width: $media-break) {
			visibility: visible;
			opacity: 1;			
		}
	}
	&--offset {
		margin-top: $map-expanded-height;
		padding-top: 4 * $spacing;
	}
	@media(min-width: $media-break) {
		max-width: 20%;
	}
	&__add {
		padding-bottom: 2 * $spacing;
	}
	&__tree {
		padding-bottom: 2 * $spacing;
		&-cat {
			padding-left: 3 * $spacing;
		}
	}
	&__all {
		width: 200px;
	}
}
</style>