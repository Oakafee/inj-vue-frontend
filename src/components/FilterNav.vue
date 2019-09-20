<template>
	<div class="filter-nav">
		<input class="filter-nav__input inj-text-input" type="text" v-model="filterInput" placeholder="Filter articles" />
		<ul class="filter-nav__results">
			<li v-for="article in filteredArticles" :key="article.pk">
				<router-link :to="article.slug" @click.native="toggleNav()">{{ article.title }}</router-link>
			</li>
		</ul>
	</div>
</template>

<script>
import store from '../store';

export default {
	name: 'FilterNav',
	props: ['articles'],
	data: function () {
		return {
			filterInput: '',
		}
	},
	computed: {
		filteredArticles() {
			if (!this.filterInput) return this.articles;
			
			let filtered = [];
			const len = this.filterInput.length;
			
			for(let i=0; i<this.articles.length; i++) {
				const title = this.articles[i].title.toLowerCase();
				const words = title.split(' ');
				
				for(let j=0; j<words.length; j++) {
					if(words[j].substring(0,len) === this.filterInput) {
						filtered.push(this.articles[i]);
						break;
					}		
				}
			}
			return filtered;
		}
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

.filter-nav {
	padding-top: $spacing;
	&__input {
		margin-left: $spacing;
	}
	&__results {
		padding: $spacing;
		height: 200px;
		overflow-y: scroll;
	}
}
</style>