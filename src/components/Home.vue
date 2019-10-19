<template>
<div class="inj-home">
	<div class="inj-home__title-area">
		<h1>Welcome </h1>
		<p>The goal of this website is to contribute to our understanding, appreciation, and love of the Garden State. </p>
	</div>
	<HomeMap />
	<RecentArticles />
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
.inj-home__title-area {
	text-align: center;
}
</style>