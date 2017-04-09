import test from 'ava';
import Vue from 'vue';
import sinon from 'sinon';

import Mocks from '../../../src/client/components/Mocks';

test.beforeEach((t) => {
  t.context.sandbox = sinon.sandbox.create();
  t.context.sandbox.stub(global, 'fetch');
});

test.afterEach.always((t) => {
  t.context.sandbox.restore();
});

test.serial('default data should be correct', (t) => {
  t.deepEqual(Mocks.data(), {
  mocks: [],
    updatable: true,
    error: null,
  });
});

test.serial('should get mocks data from server when created', async (t) => {
  fetch.withArgs('/api/mocks').returns(new Promise((resolve) => {
    resolve(new Response(
      JSON.stringify([{
        mock: {
          id: 'abc',
          directoryPath: '/path/of/mock',
          urlPath: '/mock/test',
          method: 'GET',
        },
        parsers: {
          current: 'parser-a.yml',
          user: 'parser-b.yml',
          parsers: ['parser-a.yml', 'parser-c.yml'],
        },
      }])
    ));
  }));

  const vm = new Vue(Mocks);

  await new Promise((resolve) => {
    vm.$watch('mocks', () => {
      resolve();
    });
  });

  t.deepEqual(vm.mocks, [{
    mock: {
      id: 'abc',
      directoryPath: '/path/of/mock',
      urlPath: '/mock/test',
      method: 'GET',
    },
    parsers: {
      current: 'parser-a.yml',
      user: 'parser-b.yml',
      parsers: ['parser-a.yml', 'parser-c.yml'],
    },
  }]);
});

test.serial('should set error message when fetch failed at created', async (t) => {
  fetch.withArgs('/api/mocks').returns(new Promise((resolve) => {
    resolve(new Error());
  }));

  const vm = new Vue(Mocks);

  await new Promise((resolve) => {
    vm.$watch('error', () => {
      resolve();
    });
  });

  t.is(vm.error, 'Error: Could not get mock data.');
});

test.serial('#update is should update the mock', async (t) => {
  fetch.withArgs('/api/mocks/id123').returns(new Promise((resolve) => {
    resolve(new Response());
  }));

  const vm = new Vue(Mocks);
  await vm.update('id123', 'parser-new.yml');

  t.true(fetch.calledWith('/api/mocks/id123'));
  t.deepEqual(fetch.args[1][1], {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      parser: 'parser-new.yml',
    }),
  });
});

test.serial('#update is should not updatable when until end of update', async (t) => {
  const vm = new Vue(Mocks);

  fetch.withArgs('/api/mocks/id123').returns(new Promise((resolve) => {
    resolve(new Response());
  }));

  const promise = vm.update('id123', 'parser-new.yml');

  t.is(vm.updatable, false);
  await promise;
  t.is(vm.updatable, true);
});

test.serial('#update is should restore updatable when request was failed', async (t) => {
  fetch.withArgs('/api/mocks/id123').throws();

  const vm = new Vue(Mocks);
  await vm.update('id123', 'parser-new.yml');

  t.is(vm.updatable, true);
});
