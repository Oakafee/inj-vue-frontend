<template>
<div class="inj-home">
	<div class="inj-home__title-area">
		<h1>Welcome </h1>
		<p>The goal of this website is to contribute to our understanding, appreciation, and love of the Garden State. </p>
	</div>
	<div class="inj-home__map-row">
		<HomeMap />
		<RecentArticles />
	</div>
	<FeaturedArticle article="full-of-anxiety-and-some-fear" />
</div>
</template>

<script>
import HomeMap from './HomeMap';
import RecentArticles from './RecentArticles';

export default {
	name: 'Home',
	components: { HomeMap, RecentArticles },
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
	&__map-row {
		@media(min-width:$large-break) {
			display: flex;
		}
	}
}
</style>