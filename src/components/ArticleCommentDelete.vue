<template>
	<span class="comment-delete">
		<svg
			v-show="!error"
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			class="comment-delete__icon comment-delete__icon--initial inj-fade-transition"
			:class="{ 'inj-fade-transition--hidden': confirm }"
			@click="confirm = true"
			tabindex="0"
		>
			<polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line>
		</svg>
		<span
			class="comment-delete__confirm inj-fade-transition"
			:class="{ 'inj-fade-transition--hidden': !confirm }"
			v-show="!error"
		>
			Are you sure you want to delete this comment?
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 24 24"
				class="comment-delete__icon comment-delete__icon--cancel"
				@click="confirm = false"
				tabindex="0"
			>
				<line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>
			</svg>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 24 24"
				class="comment-delete__icon comment-delete__icon--agree"
				@click="deleteComment()"
				tabindex="0"
			>
				<polyline points="20 6 9 17 4 12"></polyline>
			</svg>
		</span>
		<span v-if="error" class="inj-text-error">{{ error }}</span>
	</span>
</template>

<script>
import axios from 'axios';
import {mapState} from 'vuex';

import store from '../store';
import constants from '../constants';
import functions from '../functions';

export default {
	name: 'ArticleComments',
	props: ['comment'],
	data() {
		return {
			confirm: false,
			error: '',
		}
	},
	computed: {
		...mapState(['authToken'])
	},
	methods: {
		deleteComment() {
			let apiUrl = `${constants.API_BASE_URL}commentary/edit/${this.comment.pk}/`;
			let self = this;

			axios({
				method: 'delete',
				url: apiUrl,
				headers: functions.authHeader(self.authToken),
			})
			.then(() => {
				// handle success
				store.commit('removeComment', self.comment);
			})
			.catch((error) => {
				self.error = 'server error with delete: ' + error;
			});
		},
	}
}
</script>

<style lang="scss">
@import '../settings.scss';

.comment-delete {
	&__icon {
		fill: none;
		stroke-width: 2;
		width: 20px;
		margin-bottom: -4px;
		stroke: $color-tertiary;
		cursor: pointer;
		padding-left: $spacing;
		&--cancel {
			stroke: $color-primary;
		}
		&--agree {
			stroke: $color-quaternary;
		}
		&:focus {
			stroke: $color-horsehead;
		}
	}
	&__confirm {
		padding-left: $spacing;
		margin-left: -30px;
	}
}	
</style>