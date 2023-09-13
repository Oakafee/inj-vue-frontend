<template>
<div class="inj-home__map-side-column">
	<div class="inj-home__welcome-area">
			<h2>Welcome </h2>
			<p class="inj-home__welcome-text">The goal of this website is to contribute to our understanding, appreciation, and love of the Garden State. </p>
		</div>
	<RecentArticles />
</div>
</template>

<script>
import RecentArticles from './RecentArticles';

export default {
	name: 'HomeMapSideColumn',
	components: { RecentArticles },
}
</script>

<style lang="scss">
@import '../settings.scss';

.inj-home__map-side-column {
	padding-right: 2 * $spacing;
	@media(min-width:$large-break) {
		flex: 1 1 160px;
		order: 1;
	}
	&__author {
		display: block;
		font-size: 11pt;
		font-style: italic;
		line-height: 1;
		padding-bottom: $spacing;
	}
}
</style>