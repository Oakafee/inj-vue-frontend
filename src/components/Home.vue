<template>
<div class="inj-home">
	<div class="inj-home__title-area">
		<h2>Welcome </h2>
		<p class="inj-home__welcome-text">The goal of this website is to contribute to our understanding, appreciation, and love of the Garden State. </p>
	</div>
	<div class="inj-home__map-row">
		<HomeMap />
		<RecentArticles />
	</div>
	<FeaturedArticle slug="full-of-anxiety-and-some-fear" />
</div>
</template>

<script>
import HomeMap from './HomeMap';
import RecentArticles from './RecentArticles';
import FeaturedArticle from './FeaturedArticle';

export default {
	name: 'Home',
	components: { HomeMap, RecentArticles, FeaturedArticle },
	data: function () {
		return {
			message: '',
		}
	}
}
</script>

<style lang="scss">
@import '../settings.scss';

.inj-home {
	&__title-area {
		text-align: center;
	}
	&__welcome-text {
		margin: 0 0 7px 0;
		// this is to be equal to the side spacing with the nav, based on something with the line height
	}
	&__map-row {
		@media(min-width:$large-break) {
			display: flex;
		}
	}
}
</style>