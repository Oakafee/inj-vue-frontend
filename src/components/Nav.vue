<template>
	<div class="inj-nav" :class="{ 'inj-nav--mobile-open' : mobileOpen, 'inj-nav--show' : articleList }">
		<p><router-link to="new-article"  @click.native="toggleNav()">
			<button class="inj-button">+ Add Article</button>
		</router-link></p>
		<div class="inj-nav__tree">
			<ul class="inj-nav__tree-cat" v-for="article in mainCatArticles" :key="article.pk">
				<TreeNav :parentArticle="article" />	
			</ul>
		</div>
		<FilterNav />
	</div>
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
		...mapState({
			mobileOpen: 'mobileNavOpen',
			articleList: 'articleList',
		}),
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
	},
    methods: {
		toggleNav() {
			store.commit('toggleMobileNav');
		}
    }
}
</script>

<style lang="scss">
@import '../settings.scss';

.inj-nav {
	background-color: $color-secondary;
	visibility: hidden;
	opacity: 0;
	transition: opacity $transition-time;
	@media(max-width: $media-break) {
		width: calc(100% - 24px); // to factor in the border and the padding on the container
		position: fixed;
		top: 63px;
		z-index: 9999;
		border: 2px solid black;
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
	@media(min-width: $media-break) {
		flex: 1 0 0;
		padding: $spacing;
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