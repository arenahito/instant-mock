import test from 'ava';
import sinon from 'sinon';

import ApiLogs from '../../../src/server/api/logs';
import MockLogManager from '../../../src/server/mock/mock-log-manager';

test.beforeEach((t) => {
  t.context.sandbox = sinon.sandbox.create();
  t.context.sandbox.stub(MockLogManager, 'getLogs');
});

test.afterEach.always((t) => {
  t.context.sandbox.restore();
});

test.serial('#list is should send all logs.', (t) => {
  MockLogManager.getLogs.returns(['dummy log 1', 'dummy log 2']);

  const req = {};
  const res = createStubResponse();

  ApiLogs.list(req, res);

  t.true(MockLogManager.getLogs.calledOnce);

  t.true(res.status.calledOnce);
  t.is(res.status.args[0][0], 200);

  t.true(res.send.calledOnce);
  t.deepEqual(res.send.args[0][0], ['dummy log 1', 'dummy log 2']);
});

function createStubResponse() {
  return {
    status: sinon.stub().returnsThis(),
    send: sinon.stub().returnsThis(),
  };
}
