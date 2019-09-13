<template>
	<div id="app">
		<Title />
		<div class="inj-page">
			<router-view />
			<Nav />
		</div>
	</div>
</template>

<script>
//import Map from './components/Map.vue'
import Title from './components/Title.vue'
import Nav from './components/Nav.vue'

export default {
	name: 'app',
	components: {
		Title,
		Nav
	},
}
</script>

<style lang="scss">
@import 'settings.scss';
@import 'styles.scss';

.inj-page {
	display: flex;
}

</style>
