<template>
	<div class="filter-nav">
		<input
			class="inj-text-input inj-text-input--full-width"
			type="text"
			v-model="filterInput"
			placeholder="Find articles"
		/>
		<ul
			class="filter-nav__results"
			:class="{ 'filter-nav__results--hidden' : !filterInput }"
		>
			<li v-for="article in filteredArticles" :key="article.pk">
				<router-link
					:to="{ name: 'article', params: { slug: article.slug }}"
					tabindex="0"
				>{{ article.title }}</router-link>
			</li>
		</ul>
	</div>
</template>

<script>
import { mapState } from 'vuex';

export default {
	name: 'FilterNav',
	data: function () {
		return {
			filterInput: '',
		}
	},
	computed: {
		...mapState({
			articles: 'articleList',
		}),
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
	}
}
</script>

<style lang="scss">
@import '../settings.scss';

.filter-nav {
	&__results {
		padding-top: $spacing;
		height: 200px;
		overflow-y: scroll;
		opacity: 1;
		transition: opacity $transition-time-primary;
		&.filter-nav__results--hidden {
			visibility: hidden;
			height: 0;
			opacity: 0;
		}
	}
}
</style>