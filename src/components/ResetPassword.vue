<template>
<div class="inj-article__content">
	<div v-if="passwordUpdated">
		<p>You successfully created an account. Now log in! </p>
	</div>
	<div v-else>
		<h2 class="inj__title-area">Reset your password </h2>
		<form class="inj-reset-password">
			<input
				type="text"
				class="inj-text-input inj-text-input--full-width inj-form-element"
				:class="{ 'inj-text-input-error' : validationError.field === 'username' }"
				placeholder="Your username"
				v-model="username"
			/>
			<input
				type="password"
				class="inj-text-input inj-text-input--full-width inj-form-element"
				:class="{ 'inj-text-input-error' : validationError.field === 'password' }"
				placeholder="Create new password"
				v-model="password"
			/>
			<div class="inj-form__button-row inj-form-element">
				<span><span v-if="emailSent === 'sent'">Verification code sent </span></span>
				<button
					type="button"
					class="inj-button inj-button--full-width-mobile"
					:class="{
						'inj-button-secondary': emailSent === 'sent',
						'inj-button--disabled': emailSent === 'sending'
					}"
					:disabled="emailSent === 'sending'"
					@click="lookUpUsername()">
					<span v-if="emailSent === 'sent'">Re-send </span>
					<span v-else-if="emailSent === 'sending'">Sending... </span>
					<span v-else>Send verification code to email </span>
				</button>
			</div>
			<input
				type="text"
				class="inj-text-input inj-text-input--full-width inj-form-element"
				:class="{ 'inj-text-input-error' : validationError.field === 'userCode' }"
				placeholder="Enter email verification code"
				v-model="userCode"
				:disabled="!emailSent"
			/>
			<div class="inj-form__button-row">
			<!-- TODO: create class for submit button and validation error message on same line in desktop view -->
				<p class="inj-text-error">
					<span v-if="validationError.message">{{ validationError.message }}</span>
					</p>
				<input
					type="submit"
					value="Reset password"
					class="
						inj-form-submit-button
						inj-button 
						inj-button--full-width-mobile
					"
					:class="{
						'inj-button--error': validationError.message,
						'inj-button--disabled': emailSent !== 'sent'
					}"
					:disabled="!emailSent"
					@click="resetPassword()"
				/>
			</div>
		</form>
	</div>
</div>
</template>

<script>
import axios from 'axios';
import functions from '../functions';
import constants from '../constants';

export default {
	name: 'ResetPassword',
	props: ['prop'],
	data: function () {
		return {
			username: '',
			password: '',
			randomCode: '',
			userCode: '',
			validationError: {
				'field': '',
				'message': '',
			},
			emailSent: '',
			serverUsername: '',
			passwordUpdated: false
		}
	},
	methods: {
		lookUpUsername() {
			if (this.username) {
				this.randomCode = functions.randomCode();
				this.sendEmail();
			} else {
				this.validationError.field = "username";
				this.validationError.message = "Please enter a username";
			}
		},
		sendEmail() {
			let apiUrl = `${constants.API_BASE_URL}confirm-account-email/`;
			let emailInfo = {
				'username': this.username,
				'random_code': this.randomCode
			};
			this.emailSent = 'sending';
			let self = this;
			
			axios({
				method: 'post',
				url: apiUrl,
				// doing JSON stringify because we're not sending it to a serializer on the back end. Still maybe I should handle it with the backend
				data: JSON.stringify(emailInfo)
			})
			.then((response) => {
				self.emailSent = 'sent';
				self.serverUsername = response.data.username;
				if (self.validationError.field === 'username') {
					self.validationError.field = '';
					self.validationError.message = '';
				}
			})
			.catch((error) => {
				self.validationError.field = 'username';
				if (error.response.status === 400) {
					self.validationError.message = error.response.data;				
				} else {
					self.validationError.message = error;
				}
				self.emailSent = '';
			});
		},
		resetPassword() {
			if(
				this.usernameIsValid() &&
				this.userCodeIsValid() &&
				this.passwordIsValid()
			) this.submitResetPassword();
		},
		// TODO: a lot of this is copied and pasted from CreateAccount.vue. It would be nice to have it in a separate validations.js file, but that would involve changing the syntax somehow
		usernameIsValid() {
			if(!this.username) {
				this.validationError.field = "username";
				this.validationError.message = "Please enter a username";
				return false;
			} else if (this.username !== this.serverUsername) {
				this.validationError.field = "username";
				this.validationError.message = "The username is different from the one we did the email verification for. Please do the email verification again for this username."
				return false;
			}
			return true;
		},
		passwordIsValid() {
			if (!this.password) {
				this.validationError.field = "password"
				this.validationError.message = "Please enter a password";
				return false;
			} else if (this.password.length < 6) {
				this.validationError.field = "password"
				this.validationError.message = "Please choose a password of 6 characters or more in length"
				return false;
			} else if (this.password === this.username) {
				this.validationError.field = "password";
				this.validationError.message = "Please choose a password different from your username";
			} else return true
		},
		userCodeIsValid() {
			if(!this.userCode) {
				this.validationError.field = "userCode";
				this.validationError.message = "Please enter the code sent to your email. Click the Send Verification Code button above and check your email for the code. "
				return false;
			} else if (this.userCode !== this.randomCode) {
				this.validationError.field = "userCode";
				this.validationError.message = "The code you provided does not match the code sent to your email";
				return false;
			}
			return true;
		},
		submitResetPassword() {
		let apiUrl = `${constants.API_BASE_URL}users/${this.username}/`;
			let userInfo = {
				'username': this.username,
				'password': this.password,
			};
			let self = this;
			
			axios({
				method: 'patch',
				url: apiUrl,
				data: userInfo
			})
			.then(() => {
				self.passwordUpdated = true;
			})
			.catch((error) => {
				self.validationError.field = '';
				if (error.response.status === 404) {
					self.validationError.message = "We couldn't find that user";
				} else {
					self.validationError.message = error;
				}
			});
		},
	}
}
</script>

<style lang="scss">
	
</style>