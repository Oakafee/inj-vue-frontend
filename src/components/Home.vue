<template>
<div>
	<p>Home </p>
	<p>{{ message }} </p>
	<HomeMap />
</div>
</template>

<script>
import functions from '../functions';
import HomeMap from './HomeMap';

export default {
	name: 'Home',
	components: { HomeMap },
	data: function () {
		return {
			map: '',
			message: '',
		}
	},
	mounted() {
		functions.getMapFeatureList();
	}
}
</script>

<style lang="scss">
	
</style>