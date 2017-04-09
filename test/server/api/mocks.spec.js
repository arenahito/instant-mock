import test from 'ava';
import sinon from 'sinon';

import ApiMocks from '../../../src/server/api/mocks';
import MockManager from '../../../src/server/mock/mock-manager';

test.beforeEach((t) => {
  t.context.sandbox = sinon.sandbox.create();
  t.context.sandbox.stub(MockManager, 'getMocksWithParsers');
  t.context.sandbox.stub(MockManager, 'updateCurrentParser');
});

test.afterEach.always((t) => {
  t.context.sandbox.restore();
});

test.serial('#list is should send all mocks with parsers', async (t) => {
  MockManager.getMocksWithParsers.returns(
    { dummyKey1: 'dummyValue1', dummyKey2: 'dummyValue2' }
  );

  const req = {};
  const res = createStubResponse();

  await ApiMocks.list(req, res);

  t.true(MockManager.getMocksWithParsers.calledOnce);

  t.true(res.status.calledOnce);
  t.is(res.status.args[0][0], 200);

  t.true(res.send.calledOnce);
  t.deepEqual(res.send.args[0][0],
    { dummyKey1: 'dummyValue1', dummyKey2: 'dummyValue2' });
});

test.serial('#list is should return 500 when could not get mocks', async (t) => {
  MockManager.getMocksWithParsers.throws();

  const req = {};
  const res = createStubResponse();

  await ApiMocks.list(req, res);

  t.true(MockManager.getMocksWithParsers.calledOnce);
  t.true(res.status.calledOnce);
  t.is(res.status.args[0][0], 500);
  t.true(res.send.calledOnce);
});

test.serial('#update is should update current parser', async (t) => {
  MockManager.updateCurrentParser.returns(
    { dummyKey1: 'dummyValue1', dummyKey2: 'dummyValue2' }
  );

  const req = {
    params: {
      id: 'dummy-id',
    },
    body: {
      parser: 'dummy-parser',
    },
  };
  const res = createStubResponse();

  await ApiMocks.update(req, res);

  t.true(MockManager.updateCurrentParser.calledOnce);
  t.is(MockManager.updateCurrentParser.args[0][0], 'dummy-id');
  t.is(MockManager.updateCurrentParser.args[0][1], 'dummy-parser');

  t.true(res.status.calledOnce);
  t.is(res.status.args[0][0], 204);
  t.true(res.send.calledOnce);
});

test.serial('#update is should return 500 when could not updated', async (t) => {
  MockManager.updateCurrentParser.throws();

  const req = {
    params: {
      id: 'dummy-id',
    },
    body: {
      parser: 'dummy-parser',
    },
  };
  const res = createStubResponse();

  await ApiMocks.update(req, res);

  t.true(MockManager.updateCurrentParser.calledOnce);
  t.is(MockManager.updateCurrentParser.args[0][0], 'dummy-id');
  t.is(MockManager.updateCurrentParser.args[0][1], 'dummy-parser');

  t.true(res.status.calledOnce);
  t.is(res.status.args[0][0], 500);
  t.true(res.send.calledOnce);
});

function createStubResponse() {
  return {
    status: sinon.stub().returnsThis(),
    send: sinon.stub().returnsThis(),
  };
}
