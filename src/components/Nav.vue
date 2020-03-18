<template>
	<nav class="inj-nav" :class="{ 'inj-nav--mobile-open' : mobileNavOpen, 'inj-nav--show' : articleList, 'inj-nav--offset' : articleMapExpanded }">
		<div
			v-if="!user.id && !loginFormOpen"
			class="inj-nav__row"
		>
			<button
				class="inj-nav__login inj-button inj-button--full-width"
				@click="login"
			>Log in </button>
		</div>
		<LoginNav />
		<div v-if="user.id" class="inj-nav__row inj-nav__row--bottom">
			<button
				class="inj-button inj-button--full-width"
				@click="addArticle"
			>+ Add Article </button>
		</div>
		<div class="inj-nav__tree">
			<div v-if="!articleList[0]">Loading...</div>
			<ul class="inj-nav__tree-cat" v-for="article in mainCatArticles" :key="article.pk">
				<TreeNav :parentArticle="article" />	
			</ul>
		</div>
		<FilterNav class="inj-nav__row" />
	</nav>
</template>

<script>
import { mapState } from 'vuex';

import functions from '../functions';
import store from '../store';

import LoginNav from './LoginNav';
import TreeNav from './TreeNav';
import FilterNav from './FilterNav';

export default {
	name: 'Nav',
	components: { LoginNav, TreeNav, FilterNav },
	computed: {
		...mapState([
			'mobileNavOpen',
			'articleList',
			'articleMapExpanded',
			'user',
			'loginFormOpen'
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
	},
	methods: {
		addArticle() {
			this.$router.push('new-article');
		},
		login() {
			store.commit('toggleLoginForm', true);
		},
	}
}
</script>

<style lang="scss">
@import '../settings.scss';

.inj-nav {
	margin-top: $spacing;
	background-color: $color-secondary;
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
		@media(min-width: $media-break) {
			margin-top: $map-expanded-height;
			padding-top: 4 * $spacing;
		}
	}
	@media(min-width: $media-break) {
		max-width: 20%;
	}
	&__row {
		padding: 0 2*$spacing;
		&.inj-nav__row--bottom {
			margin-bottom: $spacing;
		}
	}
	&__login {
		margin-bottom: $spacing;
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