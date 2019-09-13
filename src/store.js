import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    mobileNavOpen: false,
  },
  mutations: {
    toggleMobileNav (state) {
      state.mobileNavOpen = !state.mobileNavOpen;
    }
  }
});

export default store;
