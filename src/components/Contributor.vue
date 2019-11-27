<template>
<div class="inj-contributor">
	<div v-if="loading">Loading... </div>
	<div v-else>
		<div v-if="loggedInUser" class="inj-contributor__user-info">
			<h1>Welcome, {{ user.first_name }}. </h1>
			<ul>
				<li>{{ user.username }}</li>
				<li>{{ user.email }} </li>
				<li>{{ `${user.first_name} ${user.last_name}` }}</li>
			</ul>
			<p>If you are having any issues, please email me at interpretation.of.nj@gmail.com </p>
		</div>
		<div class="inj-contributor__articles">
			<div v-if="contributorName">
				<h2>Articles by {{ contributorName }} </h2>
				<ul>
					<li v-for="article in articles" :key="article.pk" class="inj-contributor__article">
						<router-link :to="`../${article.slug}`">
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
			noArticles: constants.NO_CONTRIBUTOR_ARTICLES,
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
	},
	beforeRouteUpdate (to, from, next) {
		// this fires when the route changes without rerendering the component
		this.username = to.params.username;
		next();
		this.getContributorArticles();
	},
	methods: {
		getContributorArticles() {
	//		let apiUrl = constants.API_BASE_URL + constants.API_PATH + 'user/' + userId + '/';
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
		formatPubDate(rawPubDate) {
			return functions.formatDate(rawPubDate);
		}
	}
}
</script>

<style lang="scss">
@import '../settings.scss';

.inj-contributor {
	&__article {
		@media(min-width:$media-break) {
			display: inline-block;
			width: 270px;
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
			margin-right: $spacing;
		}
		&-title {
			font-size: $font-size-tertiary;
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