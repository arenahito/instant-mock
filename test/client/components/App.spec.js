import test from 'ava';
import Vue from 'vue';

import App from '../../../src/client/components/App';

test('App is should can mount', (t) => {
  const vm = new Vue(App);
  t.notThrows(vm.$mount.bind(vm));
});

