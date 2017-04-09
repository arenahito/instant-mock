import test from 'ava';
import Vue from 'vue';
import sinon from 'sinon';
import io from 'socket.io-client';
import EventEmitter from 'events';

import SinonExt from '../../helpers/sinon-ext';
import Logs from '../../../src/client/components/Logs';

test.beforeEach((t) => {
  t.context.sandbox = sinon.sandbox.create();
  t.context.sandbox.stub(global, 'fetch');
  t.context.sandbox.stub(io, 'connect');
});

test.afterEach.always((t) => {
  t.context.sandbox.restore();
});

test.serial('default data should be correct', (t) => {
  t.deepEqual(Logs.data(), {
    enableAutoExpand: true,
    logs: [],
    error: null,
  });
});

test.serial('should set error when got server information error at created', async (t) => {
  fetch.withArgs('/api/server').returns(new Promise((resolve, reject) => {
    reject();
  }));

  const vm = new Vue(Logs);

  await new Promise((resolve) => {
    vm.$watch('error', () => {
      resolve();
    });
  });

  t.is(vm.error, 'Error: Could not get server information.');
});

test.serial('should connect to server socket when created', async (t) => {
  fetch.withArgs('/api/server').returns(new Promise((resolve) => {
    resolve(new Response(
      JSON.stringify({
        socket: {
          host: 'localhost',
          port: '3010',
        },
      })
    ));
  }));

  io.connect.returns(new EventEmitter());

  await Logs.created();

  t.true(io.connect.calledOnce);
  t.is(io.connect.args[0][0], 'http://localhost:3010');
});

test.serial('should save initial logs when receive from server', async (t) => {
  fetch.withArgs('/api/server').returns(new Promise((resolve) => {
    resolve(new Response(
      JSON.stringify({
        socket: {
          host: 'localhost',
          port: '3010',
        },
      })
    ));
  }));

  const socket = new EventEmitter();
  sinon.spy(socket, 'on');

  io.connect.returns(socket);

  const vm = new Vue(Logs);
  vm.$mount();

  await SinonExt.waitForCallWith(socket.on, ['initialLogs']);

  const watcher = new Promise((resolve) => {
    vm.$watch('logs', () => {
      resolve();
    });
  });

  socket.emit('initialLogs', [
    { res: { statusCode: 200 } },
    { res: { statusCode: 201 } },
  ]);

  await watcher;

  t.deepEqual(vm.logs, [
    {
      log: { res: { statusCode: 200 } },
      show: true,
      success: true,
      warning: false,
      error: false,
    }, {
      log: { res: { statusCode: 201 } },
      show: true,
      success: true,
      warning: false,
      error: false,
    },
  ]);
});

test.serial('should set log tag when receive from server', async (t) => {
  fetch.withArgs('/api/server').returns(new Promise((resolve) => {
    resolve(new Response(
      JSON.stringify({
        socket: {
          host: 'localhost',
          port: '3010',
        },
      })
    ));
  }));

  const socket = new EventEmitter();
  sinon.spy(socket, 'on');

  io.connect.returns(socket);

  const vm = new Vue(Logs);
  vm.$mount();

  await SinonExt.waitForCallWith(socket.on, ['initialLogs']);

  const watcher = new Promise((resolve) => {
    vm.$watch('logs', () => {
      resolve();
    });
  });

  socket.emit('initialLogs', [
    { res: { statusCode: 399 } },
    { res: { statusCode: 400 } },
    { res: { statusCode: 499 } },
    { res: { statusCode: 500 } },
  ]);

  await watcher;

  t.deepEqual(vm.logs, [
    {
      log: { res: { statusCode: 399 } },
      show: true,
      success: true,
      warning: false,
      error: false,
    }, {
      log: { res: { statusCode: 400 } },
      show: true,
      success: false,
      warning: true,
      error: false,
    }, {
      log: { res: { statusCode: 499 } },
      show: true,
      success: false,
      warning: true,
      error: false,
    }, {
      log: { res: { statusCode: 500 } },
      show: true,
      success: false,
      warning: false,
      error: true,
    },
  ]);
});

test.serial('should add initial logs when receive from server', async (t) => {
  fetch.withArgs('/api/server').returns(new Promise((resolve) => {
    resolve(new Response(
      JSON.stringify({
        socket: {
          host: 'localhost',
          port: '3010',
        },
      })
    ));
  }));

  const socket = new EventEmitter();
  sinon.spy(socket, 'on');

  io.connect.returns(socket);

  const vm = new Vue(Logs);
  vm.$mount();

  await SinonExt.waitForCallWith(socket.on, ['initialLogs']);

  const watcherFirst = new Promise((resolve) => {
    vm.$watch('logs', () => {
      resolve();
    });
  });

  socket.emit('initialLogs', [
    { res: { statusCode: 200 } },
  ]);

  await watcherFirst;

  const watcherSecond = new Promise((resolve) => {
    vm.$watch('logs', () => {
      resolve();
    });
  });

  socket.emit('initialLogs', [
    { res: { statusCode: 201 } },
  ]);

  await watcherSecond;

  t.deepEqual(vm.logs, [
    {
      log: { res: { statusCode: 201 } },
      show: true,
      success: true,
      warning: false,
      error: false,
    }, {
      log: { res: { statusCode: 200 } },
      show: true,
      success: true,
      warning: false,
      error: false,
    },
  ]);
});

test.serial('should add a log when receive from server', async (t) => {
  fetch.withArgs('/api/server').returns(new Promise((resolve) => {
    resolve(new Response(
      JSON.stringify({
        socket: {
          host: 'localhost',
          port: '3010',
        },
      })
    ));
  }));

  const socket = new EventEmitter();
  sinon.spy(socket, 'on');

  io.connect.returns(socket);

  const vm = new Vue(Logs);
  vm.$mount();

  await SinonExt.waitForCallWith(socket.on, ['addLog']);

  const watcherFirst = new Promise((resolve) => {
    vm.$watch('logs', () => {
      resolve();
    });
  });

  socket.emit('addLog', { res: { statusCode: 200 } });

  await watcherFirst;

  const watcherSecond = new Promise((resolve) => {
    vm.$watch('logs', () => {
      resolve();
    });
  });

  socket.emit('addLog', { res: { statusCode: 201 } });

  await watcherSecond;

  t.deepEqual(vm.logs, [
    {
      log: { res: { statusCode: 201 } },
      show: true,
      success: true,
      warning: false,
      error: false,
    }, {
      log: { res: { statusCode: 200 } },
      show: true,
      success: true,
      warning: false,
      error: false,
    },
  ]);
});

test.serial('should receive initial message and show flag is true when enable auto expand', async (t) => {
  fetch.withArgs('/api/server').returns(new Promise((resolve) => {
    resolve(new Response(
      JSON.stringify({
        socket: {
          host: 'localhost',
          port: '3010',
        },
      })
    ));
  }));

  const socket = new EventEmitter();
  sinon.spy(socket, 'on');

  io.connect.returns(socket);

  const vm = new Vue(Logs);
  vm.$mount();
  vm.enableAutoExpand = true;

  await SinonExt.waitForCallWith(socket.on, ['initialLogs']);

  const watcher = new Promise((resolve) => {
    vm.$watch('logs', () => {
      resolve();
    });
  });

  socket.emit('initialLogs', [{ res: { statusCode: 200 } }]);

  await watcher;

  t.is(vm.logs[0].show, true);
});

test.serial('should receive initial message and show flag is false when disable auto expand', async (t) => {
  fetch.withArgs('/api/server').returns(new Promise((resolve) => {
    resolve(new Response(
      JSON.stringify({
        socket: {
          host: 'localhost',
          port: '3010',
        },
      })
    ));
  }));

  const socket = new EventEmitter();
  sinon.spy(socket, 'on');

  io.connect.returns(socket);

  const vm = new Vue(Logs);
  vm.$mount();
  vm.enableAutoExpand = false;

  await SinonExt.waitForCallWith(socket.on, ['initialLogs']);

  const watcher = new Promise((resolve) => {
    vm.$watch('logs', () => {
      resolve();
    });
  });

  socket.emit('initialLogs', [{ res: { statusCode: 200 } }]);

  await watcher;

  t.is(vm.logs[0].show, false);
});

test.serial('should receive addition message and show flag is true when enable auto expand', async (t) => {
  fetch.withArgs('/api/server').returns(new Promise((resolve) => {
    resolve(new Response(
      JSON.stringify({
        socket: {
          host: 'localhost',
          port: '3010',
        },
      })
    ));
  }));

  const socket = new EventEmitter();
  sinon.spy(socket, 'on');

  io.connect.returns(socket);

  const vm = new Vue(Logs);
  vm.$mount();
  vm.enableAutoExpand = true;

  await SinonExt.waitForCallWith(socket.on, ['addLog']);

  const watcher = new Promise((resolve) => {
    vm.$watch('logs', () => {
      resolve();
    });
  });

  socket.emit('addLog', { res: { statusCode: 200 } });

  await watcher;

  t.is(vm.logs[0].show, true);
});

test.serial('should receive addition message and show flag is false when disable auto expand', async (t) => {
  fetch.withArgs('/api/server').returns(new Promise((resolve) => {
    resolve(new Response(
      JSON.stringify({
        socket: {
          host: 'localhost',
          port: '3010',
        },
      })
    ));
  }));

  const socket = new EventEmitter();
  sinon.spy(socket, 'on');

  io.connect.returns(socket);

  const vm = new Vue(Logs);
  vm.$mount();
  vm.enableAutoExpand = false;

  await SinonExt.waitForCallWith(socket.on, ['addLog']);

  const watcher = new Promise((resolve) => {
    vm.$watch('logs', () => {
      resolve();
    });
  });

  socket.emit('addLog', { res: { statusCode: 200 } });

  await watcher;

  t.is(vm.logs[0].show, false);
});

test.serial('#toggleLog is should change shown state', async (t) => {
  fetch.withArgs('/api/server').returns(new Promise((resolve) => {
    resolve(new Response(
      JSON.stringify({
        socket: {
          host: 'localhost',
          port: '3010',
        },
      })
    ));
  }));

  const socket = new EventEmitter();
  sinon.spy(socket, 'on');

  io.connect.returns(socket);

  const vm = new Vue(Logs);
  vm.$mount();

  await SinonExt.waitForCallWith(socket.on, ['initialLogs']);

  const watcher = new Promise((resolve) => {
    vm.$watch('logs', () => {
      resolve();
    });
  });

  socket.emit('initialLogs', [
    { res: { statusCode: 200 } },
    { res: { statusCode: 201 } },
  ]);

  await watcher;

  vm.toggleLog(1);
  t.is(vm.logs[0].show, true);
  t.is(vm.logs[1].show, false);

  vm.toggleLog(1);
  t.is(vm.logs[0].show, true);
  t.is(vm.logs[1].show, true);
});

test.serial('#expandAll is should show all logs', async (t) => {
  fetch.withArgs('/api/server').returns(new Promise((resolve) => {
    resolve(new Response(
      JSON.stringify({
        socket: {
          host: 'localhost',
          port: '3010',
        },
      })
    ));
  }));

  const socket = new EventEmitter();
  sinon.spy(socket, 'on');

  io.connect.returns(socket);

  const vm = new Vue(Logs);
  vm.$mount();
  vm.enableAutoExpand = false;

  await SinonExt.waitForCallWith(socket.on, ['initialLogs']);

  const watcher = new Promise((resolve) => {
    vm.$watch('logs', () => {
      resolve();
    });
  });

  socket.emit('initialLogs', [
    { res: { statusCode: 200 } },
    { res: { statusCode: 201 } },
  ]);

  await watcher;

  vm.expandAll();
  t.is(vm.logs[0].show, true);
  t.is(vm.logs[1].show, true);
});

test.serial('#collapseAll is should hide all logs', async (t) => {
  fetch.withArgs('/api/server').returns(new Promise((resolve) => {
    resolve(new Response(
      JSON.stringify({
        socket: {
          host: 'localhost',
          port: '3010',
        },
      })
    ));
  }));

  const socket = new EventEmitter();
  sinon.spy(socket, 'on');

  io.connect.returns(socket);

  const vm = new Vue(Logs);
  vm.$mount();
  vm.enableAutoExpand = true;

  await SinonExt.waitForCallWith(socket.on, ['initialLogs']);

  const watcher = new Promise((resolve) => {
    vm.$watch('logs', () => {
      resolve();
    });
  });

  socket.emit('initialLogs', [
    { res: { statusCode: 200 } },
    { res: { statusCode: 201 } },
  ]);

  await watcher;

  vm.collapseAll();
  t.is(vm.logs[0].show, false);
  t.is(vm.logs[1].show, false);
});
