<template>
<div class="inj-featured-article">
	<div v-if="serverError">{{ serverError }} </div>
	<div v-else>
		<h3 class="inj-featured-article__callout">Featured article</h3>
		<div class="inj__title-area">
			<router-link :to="slug">
				<h2>{{ articleDetail.title }}</h2>
			</router-link>
			<h3 v-if="articleDetail.subtitle">{{ articleDetail.subtitle }} </h3>
			<h4 v-if="contributorUrl">By 
					<router-link :to="contributorUrl">{{ contributorName }}</router-link>
			</h4>
		</div>
		<div class="inj-article__text">
			<p v-html="truncatedContent"></p>
			<p class="inj-featured-article__read-more">
				<router-link :to="slug">Read more > </router-link>
			</p>
		</div>
	</div>
</div>
</template>

<script>
import axios from 'axios';
import constants from '../constants';

export default {
	name: 'FeaturedArticle',
	props: ['slug'],
	data: function () {
		return {
			articleDetail: {},
			serverError: '',
		}
	},
	computed: {
		contributorUrl() {
			if (this.articleDetail.contributor) {
				return `/contributor/${this.articleDetail.contributor.username}`
			}
			return false
		},
		contributorName() {
			if (this.articleDetail.contributor) {
				return `${this.articleDetail.contributor.first_name} ${this.articleDetail.contributor.last_name}`
			}
			return false
		},
		truncatedContent() {
			if (this.articleDetail.article_content) {
				return this.articleDetail.article_content.substring(0, constants.FEATURED_ARTICLE_LENGTH) + '...';
			}
			return "Loading..."
		}
	},
	mounted() {
			let apiUrl = constants.API_BASE_URL + constants.API_PATH + this.slug + '/';
			let self = this;
		
			axios({
				method: 'get',
				url: apiUrl,
			})
			.then((response) => {
					// handle success
					self.articleDetail = response.data;
				})
				.catch((error) => {
					// handle error
					self.serverError = error;
				});
		},
	}
</script>

<style lang="scss">
@import '../settings.scss';

.inj-featured-article {
	margin-top: 2*$spacing;
	&__callout {
		padding-left: 2*$spacing;
	}
	&__read-more {
		text-align: right;
		padding-top: 0;
		position: relative;
		top: -2 * $spacing;
	}
}
</style>