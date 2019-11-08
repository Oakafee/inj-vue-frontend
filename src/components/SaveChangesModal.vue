<template>
	<InjModal v-if="interruptedRoute">
		<p>You're still editing your article, and yet you want to go to a new page. Unbelievable. Your changes may be lost if you continue. </p>
			<div class="inj-button-row">
					<button
						class="inj-button"
						@click="followRoute(false)"
					>Go back </button>
					<button
						class="inj-button inj-button-secondary"
						@click="followRoute(true)"
					>Continue </button>
				</div>
	</InjModal>
</template>

<script>
import {mapState} from 'vuex';
import store from '../store';
import InjModal from './InjModal';

export default {
	name: 'SaveChangesModal',
	components: {
		InjModal
	},
	computed: {
		...mapState([
			'interruptedRoute',
			'editableArticle',
			'newMapFeature',
		]),
	},
	methods: {
		followRoute(go) {
			if (go) {
				if (this.editableArticle) store.commit('editArticle', null);
				if (this.newMapFeature.geometry) store.commit('addNewMapFeature', null);
				this.$router.push(this.interruptedRoute);
			}
			store.commit('saveDialogIntervention', null);
		}
	}
}
</script>

<style lang="scss">
	
</style>