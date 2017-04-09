import test from 'ava';
import sinon from 'sinon';

import ApiServer from '../../../src/server/api/server';
import ServerSettingsManager from '../../../src/server/setting/server-settings-manager';

test.beforeEach((t) => {
  t.context.sandbox = sinon.sandbox.create();
  t.context.sandbox.stub(ServerSettingsManager, 'getSettings');
});

test.afterEach.always((t) => {
  t.context.sandbox.restore();
});

test.serial('#list is should send all server settings.', (t) => {
  ServerSettingsManager.getSettings.returns(
    { dummyKey1: 'dummyValue1', dummyKey2: 'dummyValue2' }
  );

  const req = {};
  const res = createStubResponse();

  ApiServer.list(req, res);

  t.true(ServerSettingsManager.getSettings.calledOnce);

  t.true(res.status.calledOnce);
  t.is(res.status.args[0][0], 200);

  t.true(res.send.calledOnce);
  t.deepEqual(res.send.args[0][0],
    { dummyKey1: 'dummyValue1', dummyKey2: 'dummyValue2' });
});

function createStubResponse() {
  return {
    status: sinon.stub().returnsThis(),
    send: sinon.stub().returnsThis(),
  };
}
