<template>
	<div class="inj-nav" :class="{ 'inj-nav--mobile-open' : mobileOpen }">
		<ul class="inj-nav__tree" v-for="article in mainCatArticles" :key="article.pk">
			<TreeNav :parentArticle="article" :articles="articles" />	
		</ul>
		<FilterNav :articles="articles" />
	</div>
</template>

<script>
import axios from 'axios';

import store from '../store';
import constants from '../constants';

import TreeNav from './TreeNav';
import FilterNav from './FilterNav';

export default {
	name: 'Nav',
	components: { TreeNav, FilterNav },
	data: function () {
		return {
			articles: '',
			mainCatArticles: [],
		}
	},
	methods: {
		getArticleList() {
			let apiUrl = constants.API_BASE_URL + constants.API_PATH;
			let self = this;
		
			axios.get(apiUrl)
				.then(function (response) {
					// handle success
					self.articles = response.data;
					self.getMainCatList();
				})
				.catch(function (error) {
					// handle error
					console.log('article list call failed');
					return error;
				});
		},
		getMainCatList() {
			for(let i=0; i<this.articles.length; i++) {
				if(this.articles[i].main_cat) {
					this.mainCatArticles.push(this.articles[i])
				}
			}
		},
	},
	computed: {
		mobileOpen () {
			return this.$store.state.mobileNavOpen;
		}
	},
	mounted() {
		this.getArticleList();
	}
}
</script>

<style lang="scss">
@import '../settings.scss';

.inj-nav {
	background-color: $color-secondary;
	@media(max-width: $media-break) {
		width: calc(100% - 4px); //to factor in the border I guess?
		position: absolute;
		top: 63px;
		z-index: 9999;
		transition: opacity 0.6s;
		border: 2px solid black;
		border-top: none;
		visibility: hidden;
		opacity: 0;
		padding: $spacing;
	}
	&--mobile-open {
		visibility: visible;
		opacity: 1;
	}
	@media(min-width: $media-break) {
		flex: 1 0 0;
		padding: $spacing;
	}
	&__tree {
		padding-left: 3 * $spacing;
	}
	&__all {
		width: 200px;
	}
}
</style>