<template>
<div class="inj-article__content">
	<div v-if="userCreated">
		<p>You successfully created an account. Now log in! </p>
	</div>
	<div v-else>
		<h2 class="inj__title-area">Create an Interpretation of New Jersey account </h2>
		<form class="inj-create-account">
			<p>All fields are required </p>
			<input
				type="text"
				class="inj-text-input inj-text-input--full-width inj-form-element"
				:class="{ 'inj-text-input-error' : validationError.field === 'username' }"
				placeholder="Create a username"
				v-model="username"
			/>
			<input
				type="text"
				class="inj-text-input inj-text-input--full-width inj-form-element"
				:class="{ 'inj-text-input-error' : validationError.field === 'firstName' }"
				placeholder="First Name"
				v-model="firstName"
			/>
			<input
				type="text"
				class="inj-text-input inj-text-input--full-width inj-form-element"
				:class="{ 'inj-text-input-error' : validationError.field === 'lastName' }"
				placeholder="Last Name"
				v-model="lastName"
			/>
			<input
				type="password"
				class="inj-text-input inj-text-input--full-width inj-form-element"
				:class="{ 'inj-text-input-error' : validationError.field === 'password' }"
				placeholder="Create password"
				v-model="password"
			/>
			<p>I won't share your email with anyone. I will only use it to send you verification codes when you create an account or if you forget your password. </p>
			<input
				type="text"
				class="inj-text-input inj-text-input--full-width inj-form-element"
				:class="{ 'inj-text-input-error' : validationError.field === 'emailAddress' }"
				placeholder="Email address"
				v-model="emailAddress"
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
					@click="emailVerification()">
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
					value="Create account"
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
					@click="createAccount()"
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
	name: 'CreateAccount',
	data: function () {
		return {
			username: '',
			firstName: '',
			lastName: '',
			password: '',
			emailAddress: '',
			randomCode: '',
			userCode: '',
			emailSent: '',
			validationError: {
				'field': '',
				'message': '',
			},
			userCreated: false,
		}
	},
	methods: {
		emailVerification() {
			if (this.emailIsValid()) {
				this.randomCode = functions.randomCode();
				this.sendEmail();
			}
		},
		emailIsValid() {
			if (!this.emailAddress) {
				this.validationError.field = "emailAddress"
				this.validationError.message = "Please enter an email address";
				return false;
			} else if (!functions.emailValidation(this.emailAddress)) {
				this.validationError.field = "emailAddress"
				this.validationError.message = "Please enter a valid email address";
				return false;		
			} else return true;
		},
		sendEmail() {
			let apiUrl = `${constants.API_BASE_URL}confirm-account-email/`;
			let emailInfo = {
				'email_address': this.emailAddress,
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
			.then(() => {
				self.emailSent = 'sent';
				if (self.validationError.field === 'emailAddress') {
					self.validationError.field = '';
					self.validationError.message = '';
				}
			})
			.catch((error) => {
				self.validationError.field = 'emailAddress';
				self.validationError.message = error;
			});
		},
		userInfoIsValid() {
			if(!this.usernameIsValid) {
				return false;
			} else if(!this.firstName) {
				this.validationError.field = "firstName"
				this.validationError.message = "Please enter a first name";
				return false;
			} else if(!this.lastName) {
				this.validationError.field = "lastName"
				this.validationError.message = "Please enter a last name";
				return false;
			} else if (!this.passwordIsValid()) {
				return false;
			} else if (!this.emailIsValid()) {
				return false;
			} else if (!this.userCodeIsValid()) {
				return false;
			} else return true;		
		},
		usernameIsValid() {
			if (!this.emailAddress) {
				this.validationError.field = "username"
				this.validationError.message = "Please enter a username";
				return false;
			} else if (!functions.usernameValidation(this.username)) {
				this.validationError.field = "username"
				this.validationError.message = "Please enter a valid username, without any weird characters";
				return false;		
			} else return true;		
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
		createAccount() {
			if(this.userInfoIsValid()) this.submitCreateAccount();
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
		submitCreateAccount() {
			let apiUrl = `${constants.API_BASE_URL}users/create/`;
			let userInfo = {
				'email': this.emailAddress,
				'username': this.username,
				'password': this.password,
				'first_name': this.firstName,
				'last_name': this.lastName
			};
			let self = this;
			
			axios({
				method: 'post',
				url: apiUrl,
				data: userInfo
			})
			.then((response) => {
				self.userCreated = true;
				console.log(response.data);
			})
			.catch((error) => {
				self.validationError.field = '';
				if (error.response.status === 400) {
					if (error.response.data.username) {
						self.validationError.message = error.response.data.username;
					} else {
						self.validationError.message = error.response.data;
					}
				} else {
					self.validationError.message = error;
				}
			});
		}
		
	}
}
</script>

<style lang="scss">
	
</style>