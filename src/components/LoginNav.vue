<template>
	<div>
		<div class="inj-login-nav__login-text inj-nav__row">
			<span v-if="authToken">
				Welcome <router-link to="user-page">Jesse Fried</router-link>,&nbsp;
				<a href="#" @click="logout($event)">Log out </a>
			</span>
			<router-link to="create-account" v-else>Create an account </router-link>
		</div>
		<form 
			class="inj-login-nav__form inj-nav__row"
			:class="{ 'inj-login-nav__form--hidden': !loginFormOpen }"
			id="loginForm"
		>
			<input
				type="text"
				class="inj-text-input inj-text-input--full-width inj-form-element"
				placeholder="Username"
				v-model="username"
			/>
			<input
				type="password"
				class="inj-text-input inj-text-input--full-width inj-form-element"
				placeholder="Password"
				v-model="password"
			/>
			<div class="inj-login-nav__submit-row">
				<svg
					class="inj-login-nav__close"
					@click="closeForm"
					viewBox="0 0 24 24"
				>
					<line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>
				</svg>
				<input
					type="submit"
					value="Log in for real"
					class="inj-form-submit-button inj-button inj-button-secondary inj-button-small"
					:class="{ 'inj-button-error' : validationError.message }"
					@click="submitLoginForm()"
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

export default {
	name: 'LoginNav',
	computed: {
		...mapState([
			'authToken',
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
		}
	},
	methods: {
		logout(event) {
			event.preventDefault();
			store.commit('storeAuthToken', null);
		},
		submitLoginForm() {
			if (this.loginIsValid()) this.postLoginInfo();
			// store.commit('setAuthentication', true);
		},
		loginIsValid() {
			return true
		},
		postLoginInfo() {
			let apiUrl = constants.API_BASE_URL + constants.API_LOGIN_PATH;
			let loginInfo = {
				'username': this.username,
				'password': this.password
			}
			//let self = this;
			
			axios.post(apiUrl, loginInfo)
				.then((response) => {
					store.commit('storeAuthToken', response.data.token)
				})
				.catch((error) => {
					console.log(error);
				});
		},
		closeForm() {
			store.commit('toggleLoginForm', false);
		}
	}
}
</script>

<style lang="scss">
@import '../settings.scss';

.inj-login-nav {
	&__login-text {
		margin-top: $spacing;
	}
	&__form {
		height: 115px;
		opacity: 1;
		transition-property: height, opacity;
		transition-duration: $transition-time;
		&.inj-login-nav__form--hidden {
			height: 0;
			opacity: 0;
			padding-bottom: 0;
			visibility: hidden;
		}
	}
	&__submit-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	&__close {
		width: 24px;
		stroke: black;
		stroke-width: 2px;
		cursor: pointer;
	}
}
</style>