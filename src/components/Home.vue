<template>
<div>
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
	
</style>