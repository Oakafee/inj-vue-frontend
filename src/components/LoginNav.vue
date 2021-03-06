<template>
	<div>
		<div class="inj-login-nav__welcome inj-nav__row">
			<span v-if="user.id">
				Welcome
				<router-link :to="{ name: 'contributor', params: { username: user.username }}">
					{{ `${user.first_name} ${user.last_name}` }}
				</router-link>, 
				<a href="#" @click="logout($event)">Log out </a>
			</span>
			<span v-else-if="!loginFormOpen"><router-link to="create-account">Create an account</router-link> to add or comment </span>
		</div>
		<form 
			class="inj-login-nav__form inj-nav__row"
			:class="{ 'inj-login-nav__form--hidden': !loginFormOpen }"
			id="loginForm"
			@submit.prevent="submitLoginForm()"
		>
			<div class="inj-form__button-row">
				<router-link to="reset-password">Forgot password? </router-link>			
				<svg
					class="inj-login-nav__close"
					@click="closeForm"
					viewBox="0 0 24 24"
				>
					<line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>
				</svg>
			</div>
			<input
				type="text"
				class="inj-text-input inj-text-input--full-width inj-form-element"
				:class="{ 'inj-text-input-error' : validationError.field === 'username' }"
				placeholder="Username"
				v-model="username"
			/>
			<input
				type="password"
				class="inj-text-input inj-text-input--full-width inj-form-element"
				:class="{ 'inj-text-input-error' : validationError.field === 'password' }"
				placeholder="Password"
				v-model="password"
			/>
			<div class="inj-form__button-row">
				<span class="inj-text-error">{{ validationError.message }}  </span>
				<span v-if="submitInProgress">Logging in... </span>
				<input
					v-else
					type="submit"
					value="Log in"
					class="inj-form-submit-button inj-button inj-button-secondary inj-button-small"
					:class="{ 'inj-button--error' : validationError.message }"
				/>
			</div>
		</form>
	</div>
</template>

<script>
import axios from 'axios';
import { mapState } from 'vuex';
import store from '../store';
import constants from '../constants';
import functions from '../functions';

export default {
	name: 'LoginNav',
	computed: {
		...mapState([
			'user',
			'loginFormOpen'
		]),
	},
	data: function () {
		return {
			username: "",
			password: "",
			validationError: {
				"field": "",
				"message": "",
			},
			submitInProgress: false,
		}
	},
	mounted() {
		let authToken = window.localStorage.getItem('authTokenINJ');
		let username = window.localStorage.getItem('usernameINJ');
		if (authToken && username) {
			store.commit('storeAuthToken', authToken);
			functions.getUserInfo(username, authToken);
		}
	},
	methods: {
		logout(event) {
			event.preventDefault();
			store.commit('storeAuthToken', null);
			store.commit('getUserInfo', {});
			window.localStorage.removeItem('authTokenINJ');
			window.localStorage.removeItem('usernameINJ');
		},
		submitLoginForm() {
			if (this.loginIsValid()) this.postLoginInfo();
			// store.commit('setAuthentication', true);
		},
		loginIsValid() {
			if(!this.username) {
				this.validationError.field = "username"
				this.validationError.message = "Please enter a username";
				return false;
			} else if (!this.password) {
				this.validationError.field = "password"
				this.validationError.message = "Please enter your password";
				return false;
			} else return true;
		},
		postLoginInfo() {
			let apiUrl = constants.API_BASE_URL + constants.API_LOGIN_PATH;
			let loginInfo = {
				'username': this.username,
				'password': this.password
			}
			this.submitInProgress = true;
			let self = this;
			
			axios.post(apiUrl, loginInfo)
				.then((response) => {
					this.submitInProgress = false;
					store.commit('storeAuthToken', response.data.token);
					functions.getUserInfo(self.username, response.data.token);
					window.localStorage.setItem('authTokenINJ', response.data.token);
					window.localStorage.setItem('usernameINJ', self.username);
					self.validationError.field = "";
					self.validationError.message = "";
				})
				.catch((error) => {
					this.submitInProgress = false;
					if (error.response.status === 400) {
						self.validationError.message = "Sorry, you're login info is incorrect";
					} else {
						self.validationError.message = "Server error, please try again later"
					}
				});
		},
		closeForm() {
			store.commit('toggleLoginForm', false);
			this.validationError.field = "";
			this.validationError.message = "";
		}
	}
}
</script>

<style lang="scss">
@import '../settings.scss';

.inj-login-nav {
	&__welcome {
		font-size: $font-size-primary;
		line-height: $line-height-secondary;
		margin-bottom: $spacing;
	}
	&__form {
		height: 175px;
		opacity: 1;
		transition-property: height, opacity;
		transition-duration: $transition-time-primary;
		&.inj-login-nav__form--hidden {
			height: 0;
			opacity: 0;
			padding-bottom: 0;
			visibility: hidden;
		}
	}
	&__close {
		width: 24px;
		stroke: black;
		stroke-width: 2px;
		cursor: pointer;
	}
}
</style>