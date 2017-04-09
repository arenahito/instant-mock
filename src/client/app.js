/** @module */

import 'babel-polyfill';
import Vue from 'vue';

import App from './components/App.vue';

// eslint-disable-next-line no-new
new Vue({
  el: '#app',
  components: {
    App,
  },
  template: '<app></app>',
});
