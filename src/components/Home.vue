<template>
<div>
	<p>Home </p>
	<p>{{ message }} </p>
	<HomeMap />
</div>
</template>

<script>
import HomeMap from './HomeMap';

export default {
	name: 'Home',
	components: { HomeMap },
	data: function () {
		return {
			message: '',
		}
	}
}
</script>

<style lang="scss">
	
</style>