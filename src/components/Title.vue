<template>
<header class="inj-header">
	<div class="inj-header__left">
		<router-link to="/">
			<img :src="capSrc" class="inj-header__img" />
			<img :src="sealSrc" class="inj-header__img--desktop" />
		</router-link>
	</div>
	<div class="inj-header__center">
		<h1 class="inj-header__title">Interpretation of<wbr /> New Jersey </h1>
	</div>
	<div class="inj-header__right">
		<svg class="inj-header__img inj-header__menu" @click="toggleNav()" viewBox="0 0 24 24" width="32" height="32" stroke-width="2">
			<line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line>
		</svg>
		<router-link to="/pulaski-skyway">
			<img :src="skywaySrc" class="inj-header__img--desktop" />
		</router-link>
	</div>
</header>
</template>

<script>
import constants from '../constants';
import store from '../store.js';

export default {
	name: 'Title',
	data() {
		return {
			capSrc: `${constants.STATIC_BASE_URL}liberty-cap-small.png`,
			sealSrc: `${constants.STATIC_BASE_URL}seal.svg`,
			skywaySrc: `${constants.STATIC_BASE_URL}skyway-circle.png`,
		}
	},
	methods: {
		toggleNav() {
			store.commit('toggleMobileNav');
		}
	},
}
</script>

<style lang="scss">
@import '../settings.scss';

.inj-header {
	background-color: $color-primary;
	display: flex;
	border: 2px solid black;
	
	@media (max-width: $media-break) {
		position: sticky;
		top: 0;
		z-index: 10000;
		height: 60px; //this is for positioning the fixed mobile nav beneath it
	}
	
	&__left, &__right {
		padding: $spacing;
		display: flex;
		justify-content: center;
		align-items: center;
	}
	&__center {
		flex: 1 1 auto;
		display: flex;
		justify-content: center;
		align-items: center;
		
	}
	&__title {
		color: white;
		font-variant: small-caps;
		letter-spacing: 1.1px;
		font-size: 14pt;
		@media (min-width: $media-break) {
			font-size: 25pt;
		}
		
	}
	&__img {
		@media (min-width: $media-break) {
			display: none;
		}
		&--desktop {
			display: none;
			width: 80px;
			@media (min-width: $media-break) {
				display: block;
			}
		}
	}
	&__menu {
		stroke: white;
		cursor: pointer;
		transition: stroke 0.2s;
		&:hover {
			stroke: $color-tertiary;
		}
	}
}

</style>