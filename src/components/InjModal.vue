<template>
<div>
<div class="inj-modal__background"></div>
<div class="inj-modal__container">
	<div class="inj-modal__box">
		<slot></slot>
	</div>
</div>
</div>
</template>

<script>

export default {
	name: 'InjModal',
}
</script>

<style lang="scss">
@import '../settings.scss';

.inj-modal {
	&__background {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		// very cheap solution
		height: 300vh;
		opacity: 0.8;
		background-color: $color-secondary;
		z-index: 99999;
	}
	&__container {
		position: fixed;
		top: 0;
		z-index: 99999;
		width: 100%;
	}
	&__box {
		border: 2px solid black;
		max-width: 300px;
		margin: 2*$spacing auto;
		padding: $spacing;
		background-color: $color-secondary;
	}
}
</style>