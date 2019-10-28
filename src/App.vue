<template>
	<div id="app">
		<Title />
		<div class="inj-page__wrapper">
			<div v-if="!mobileNavOpen" class="inj-page__content">
				<router-view />
			</div>
			<Nav />
		</div>
	</div>
</template>

<script>
import {mapState} from 'vuex';

import store from './store.js'
//import Map from './components/Map.vue'
import Title from './components/Title.vue'
import Nav from './components/Nav.vue'

export default {
	name: 'app',
	components: {
		Title,
		Nav
	},
	computed: mapState(['mobileNavOpen']),
	watch: {
		$route() {
			if (this.mobileNavOpen) {
				store.commit('toggleMobileNav', false);
			}
		}
	}
}
</script>

<style lang="scss">
@import 'styles.scss';

.inj-page {
	&__wrapper {
		display: flex;
		justify-content: center;
	}
	&__content {
		padding: 0 $spacing;
		@media(min-width:$large-break) {
			width: $page-content-width;
		}
	}
}
</style>
