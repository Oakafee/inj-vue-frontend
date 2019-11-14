<template>
<div>
	<button class="inj-button" @click="sendEmail">Send email </button>
	<p class="inj-error-text" v-if="validationError.message">{{ validationError.message }} </p>
</div>
</template>

<script>
import axios from 'axios';
import constants from '../constants';

export default {
	name: 'CreateAccount',
	data: function () {
		return {
			validationError: {
				'field': '',
				'message': '',
			},
		}
	},
	methods: {
		sendEmail() {
			let apiUrl = `${constants.API_BASE_URL}confirm-account-email/`;
			let emailInfo = {
				'email_address': 'jefrttt@gmail.com',
				'random_code': '123456'
			};
			let self = this;
			
			axios({
				method: 'post',
				url: apiUrl,
				data: JSON.stringify(emailInfo)
			})
			.then((response) => {
				alert('good account email confirmation');
			})
			.catch((error) => {
				self.validationError.message = error;
			});
		}
	}
}
</script>

<style lang="scss">
	
</style>