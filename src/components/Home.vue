<template>
<div class="inj-home">
	<div class="inj-home__map-row">
		<HomeMap />
		<HomeMapSideColumn />
	</div>
	<FeaturedArticle slug="full-of-anxiety-and-some-fear" />
</div>
</template>

<script>
import HomeMap from './HomeMap';
import HomeMapSideColumn from './HomeMapSideColumn';
import FeaturedArticle from './FeaturedArticle';

export default {
	name: 'Home',
	components: { HomeMap, HomeMapSideColumn, FeaturedArticle },
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
	&__map-row {
		margin-top: $spacing;
		@media(min-width:$large-break) {
			display: flex;
		}
	}
}
</style>