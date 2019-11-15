<template>
<div class="inj-article__content">
	<div v-if="created">
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
			<input
				type="text"
				class="inj-text-input inj-text-input--full-width inj-form-element"
				:class="{ 'inj-text-input-error' : validationError.field === 'emailAddress' }"
				placeholder="Email address"
				v-model="emailAddress"
			/>
			<div class="inj-form-submit-button inj-form-element">
				<button
					class="inj-button"
					:class="{ 'inj-button-secondary': emailSent }"
					@click="emailVerification()">
					<span v-if="emailSent">Re-send verification code </span>
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
			<p class="inj-text-error" v-if="validationError.message">{{ validationError.message }}</p>
			<div class="inj-form-submit-button">
			<!-- TODO: create class for submit button and validation error message on same line in desktop view -->
				<input
					type="submit"
					value="Create account"
					class="inj-form-submit-button inj-button"
					:class="{
						'inj-button--error': validationError.message,
						'inj-button--disabled': !emailSent
					}"
					:disabled="!emailSent"
					@click="submitCreateAccount()"
				/>
			</div>
			<p class="inj-error-text" v-if="validationError.message">{{ validationError.message }} </p>
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
			emailSent: false,
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
			let self = this;
			
			axios({
				method: 'post',
				url: apiUrl,
				// doing JSON stringify because we're not sending it to a serializer on the back end. Still maybe I should handle it with the backend
				data: JSON.stringify(emailInfo)
			})
			.then(() => {
				self.emailSent = true;
			})
			.catch((error) => {
				self.validationError.field = 'emailAddress';
				self.validationError.message = error;
			});
		},
		userInfoIsValid() {
			if(!this.username) {
				this.validationError.field = "username"
				this.validationError.message = "Please enter a username";
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
			}
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
				self.created = true;
				console.log(response.data);
			})
			.catch((error) => {
				self.validationError.field = '';
				self.validationError.message = error;
			});
		}
		
	}
}
</script>

<style lang="scss">
	
</style>