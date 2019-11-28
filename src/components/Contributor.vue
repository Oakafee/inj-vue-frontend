<template>
<div class="inj-contributor">
	<div v-if="loading">Loading... </div>
	<div v-else>
		<div v-if="loggedInUser" class="inj-contributor__user-info">
			<h1>Welcome, {{ user.first_name }}. </h1>
			<ul>
				<li>{{ user.username }}</li>
				<li>{{ `${user.first_name} ${user.last_name}` }}</li>
			</ul>
			<p>If you are having any issues, please email me at interpretation.of.nj@gmail.com </p>
		</div>
		<div class="inj-contributor__articles">
			<div v-if="contributorName">
				<h2>Articles by {{ contributorName }} </h2>
				<ul>
					<li v-for="article in articles" :key="article.pk" class="inj-contributor__article">
						<router-link
							:to="`../${article.slug}`"
							class="inj-contributor__article-title"
						>
							{{ article.title }}
						</router-link>
						<div class="inj-contributor__article-date">
							{{ formatPubDate(article.pub_date) }}
						</div>
					</li>
				</ul>
			</div>
			<div v-else>{{ noArticles }} </div>
		</div>
		<div class="inj-contributor__commentary">
			<div v-if="commentary.length > 0 && commentary[0].article">
				<h2>Commentary by {{ contributorName }} </h2>
				<ul>
					<li v-for="comment in commentary" :key="comment.pk" class="inj-contributor__article">
						<div class="inj-contributor__comment-title">
							"{{ comment.com_title }}"
						</div>
						<div class="inj-contributor__comment-date">
							<router-link
								:to="`../${comment.article.slug}`"
								class="inj-contributor__comment-subhead"
							>
								{{ comment.article.title }}
							</router-link> - {{ comment.pub_date.substring(0,10) }}
						</div>
					</li>
				</ul>
			</div>
			<div v-else>{{ noCommentary }} </div>
		</div>
	</div>
</div>
</template>

<script>
import axios from 'axios';
import {mapState} from 'vuex';
import router from '../router';
import functions from '../functions';
import constants from '../constants';

export default {
	name: 'Contributor',
	data: function () {
		return {
			username: '',
			articles: {},
			commentary: {},
			noArticles: constants.NO_CONTRIBUTOR_ARTICLES,
			noCommentary: constants.NO_CONTRIBUTOR_COMMENTARY,
			loading: false,
		}
	},
	computed: {
		contributorName() {
			if (this.articles[0]) {
				return `${this.articles[0].contributor.first_name} ${this.articles[0].contributor.last_name}`
			}
			return false
		},
		loggedInUser() {
			if (this.user) {
				if (this.user.username === this.username) {
					return true;
				}
			}
			return false;
		},
		...mapState(['user']),
	},
	mounted() {
		this.username = this.$route.params.username;
		this.getContributorArticles();
		this.getContributorCommentary();
	},
	beforeRouteUpdate (to, from, next) {
		// this fires when the route changes without rerendering the component
		this.username = to.params.username;
		next();
		this.getContributorArticles();
	},
	methods: {
		getContributorArticles() {
			let apiUrl = `${constants.API_BASE_URL + constants.API_PATH}user/${this.username}/`;
			let self = this;
			this.loading = true;
		
			axios({
				method: 'get',
				url: apiUrl,
			})
			.then((response) => {
					self.articles = response.data;
					this.loading = false;
				})
				.catch((error) => {
					// handle error
					if (error.response.status === 404) {
						router.push({ name: '404' });
					} else {
						console.log('error with loading contributor articles: ', error);
					}
					this.loading = false;
				});
		},
		getContributorCommentary() {
			let apiUrl = `${constants.API_BASE_URL}commentary/user/${this.username}/`;
			let self = this;
		
			axios({
				method: 'get',
				url: apiUrl,
			})
			.then((response) => {
					self.commentary = response.data;
				})
				.catch((error) => {
					// handle error
					if (error.response.status === 404) {
						router.push({ name: '404' });
					} else {
						console.log('error with loading contributor commentary: ', error);
					}
				});
		},
		formatPubDate(rawPubDate) {
			return functions.formatDate(rawPubDate);
		}
	}
}
</script>

<style lang="scss">
@import '../settings.scss';

.inj-contributor {
	&__articles, &__commentary {
		@media(min-width:$media-break) {
			display: inline-block;
			width: 50%;
			vertical-align: top;
		}
	}
	&__article, &__comment {
		&-title {
			font-size: $font-size-tertiary;
		}
		&-subhead {
			line-height: 1.2;
		}
		&-date {
			font-size: $font-size-secondary;
			font-style: italic;
			line-height: 1;
			margin-bottom: $spacing;
		}
	}
}
</style>