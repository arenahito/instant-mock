import path from 'path';
import test from 'ava';
import sinon from 'sinon';

import MockCreator from '../../../src/server/mock/mock-creator';
import { TestMockManager } from '../../../src/server/mock/mock-manager';

const PARSERS_PATH = path.join(__dirname, 'parsers');

test('created mock api is should send 500 when could not get parsers', async (t) => {
  const manager = new TestMockManager();
  sinon.stub(manager, 'getParsers').throws();

  const mockApi = MockCreator.create(createEmptyMockData(), manager);

  const req = sinon.spy();
  const res = createStubResponse();

  await mockApi(req, res);

  t.true(res.status.calledOnce);
  t.is(res.status.args[0][0], 500);
  t.true(res.send.calledOnce);
});

test('created mock api is should send 500 when current parser format was invalid', async (t) => {
  const manager = new TestMockManager();
  sinon.stub(manager, 'getParsers').returns({
    current: 'invalid-format.xxx',
    user: '',
    parsers: [],
  });

  const mockApi = MockCreator.create(createEmptyMockData(), manager);

  const req = sinon.spy();
  const res = createStubResponse();

  await mockApi(req, res);

  t.true(res.status.calledOnce);
  t.is(res.status.args[0][0], 500);
  t.true(res.send.calledOnce);
});

test('created mock api is should can send response by js parser', async (t) => {
  const manager = new TestMockManager();
  sinon.stub(manager, 'getParsers').returns({
    current: 'parser-simple.js',
    user: '',
    parsers: [],
  });

  const mockData = createEmptyMockData();
  mockData.directoryPath = PARSERS_PATH;

  const mockApi = MockCreator.create(mockData, manager);

  const req = sinon.spy();
  const res = createStubResponse();

  await mockApi(req, res);

  t.true(res.status.calledOnce);
  t.is(res.status.args[0][0], 200);

  t.true(res.set.calledOnce);
  t.deepEqual(res.set.args[0][0], {
    'content-type': 'application/text',
  });

  t.true(res.send.calledOnce);
  t.is(res.send.args[0][0], 'test message');
});

test('js parser is should can access request data', async (t) => {
  const manager = new TestMockManager();
  sinon.stub(manager, 'getParsers').returns({
    current: 'parser-access-request.js',
    user: '',
    parsers: [],
  });

  const mockData = createEmptyMockData();
  mockData.directoryPath = PARSERS_PATH;

  const mockApi = MockCreator.create(mockData, manager);

  const req = { body: 'this is request body' };
  const res = createStubResponse();

  await mockApi(req, res);

  t.true(res.status.calledOnce);
  t.is(res.status.args[0][0], 200);

  t.true(res.set.calledOnce);
  t.deepEqual(res.set.args[0][0], {
    'content-type': 'application/text',
  });

  t.true(res.send.calledOnce);
  t.is(res.send.args[0][0], 'this is request body');
});

test('yaml parser is should be setable body from file', async (t) => {
  const manager = new TestMockManager();
  sinon.stub(manager, 'getParsers').returns({ current: 'parser-file-body.yml' });

  const mockData = createEmptyMockData();
  mockData.directoryPath = PARSERS_PATH;

  const mockApi = MockCreator.create(mockData, manager);

  const req = createRequest();
  const res = createStubResponse();

  await mockApi(req, res);

  t.true(res.status.calledOnce);
  t.is(res.status.args[0][0], 200);

  t.true(res.set.calledOnce);
  t.deepEqual(res.set.args[0][0], {
    'Content-Type': 'application/json',
  });

  t.true(res.send.calledOnce);
  t.deepEqual(JSON.parse(res.send.args[0][0]), {
    key1: 'value1',
    key2: 'value2',
  });
});

test('yaml parser is should be setable body in parser file', async (t) => {
  const manager = new TestMockManager();
  sinon.stub(manager, 'getParsers').returns({ current: 'parser-raw-body.yml' });

  const mockData = createEmptyMockData();
  mockData.directoryPath = PARSERS_PATH;

  const mockApi = MockCreator.create(mockData, manager);

  const req = createRequest();
  const res = createStubResponse();

  await mockApi(req, res);

  t.true(res.status.calledOnce);
  t.is(res.status.args[0][0], 200);

  t.true(res.set.calledOnce);
  t.deepEqual(res.set.args[0][0], {
    'Content-Type': 'application/text',
  });

  t.true(res.send.calledOnce);
  t.is(res.send.args[0][0], 'test body');
});

test('yaml parser is should allow body was undefined', async (t) => {
  const manager = new TestMockManager();
  sinon.stub(manager, 'getParsers').returns({ current: 'parser-none-body.yml' });

  const mockData = createEmptyMockData();
  mockData.directoryPath = PARSERS_PATH;

  const mockApi = MockCreator.create(mockData, manager);

  const req = createRequest();
  const res = createStubResponse();

  await mockApi(req, res);

  t.true(res.status.calledOnce);
  t.is(res.status.args[0][0], 200);

  t.true(res.set.calledOnce);
  t.deepEqual(res.set.args[0][0], {
    'Content-Type': 'application/text',
  });

  t.true(res.send.calledOnce);
  t.is(res.send.args[0][0], '');
});

test('yaml parser is should allow headers was undefined', async (t) => {
  const manager = new TestMockManager();
  sinon.stub(manager, 'getParsers').returns({ current: 'parser-none-headers.yml' });

  const mockData = createEmptyMockData();
  mockData.directoryPath = PARSERS_PATH;

  const mockApi = MockCreator.create(mockData, manager);

  const req = createRequest();
  const res = createStubResponse();

  await mockApi(req, res);

  t.true(res.status.calledOnce);
  t.is(res.status.args[0][0], 200);

  t.true(res.set.calledOnce);
  t.deepEqual(res.set.args[0][0], {});

  t.true(res.send.calledOnce);
  t.is(res.send.args[0][0], 'test body');
});

test('yaml parser is should allow status code was undefined', async (t) => {
  const manager = new TestMockManager();
  sinon.stub(manager, 'getParsers').returns({ current: 'parser-none-status.yml' });

  const mockData = createEmptyMockData();
  mockData.directoryPath = PARSERS_PATH;

  const mockApi = MockCreator.create(mockData, manager);

  const req = createRequest();
  const res = createStubResponse();

  await mockApi(req, res);

  t.true(res.status.calledOnce);
  t.is(res.status.args[0][0], 200);

  t.true(res.set.calledOnce);
  t.deepEqual(res.set.args[0][0], {
    'Content-Type': 'application/text',
  });

  t.true(res.send.calledOnce);
  t.is(res.send.args[0][0], 'test body');
});

test('yaml parser is should be setable multiple headers', async (t) => {
  const manager = new TestMockManager();
  sinon.stub(manager, 'getParsers').returns({ current: 'parser-multiple-headers.yml' });

  const mockData = createEmptyMockData();
  mockData.directoryPath = PARSERS_PATH;

  const mockApi = MockCreator.create(mockData, manager);

  const req = createRequest();
  const res = createStubResponse();

  await mockApi(req, res);

  t.true(res.status.calledOnce);
  t.is(res.status.args[0][0], 200);

  t.true(res.set.calledOnce);
  t.deepEqual(res.set.args[0][0], {
    'Content-Type': 'application/text',
    'X-Mock': 'dummy',
  });

  t.true(res.send.calledOnce);
  t.is(res.send.args[0][0], 'test body');
});

test('yaml parser is should return 500 when body file was not found', async (t) => {
  const manager = new TestMockManager();
  sinon.stub(manager, 'getParsers').returns({ current: 'parser-not-found-body-file.yml' });

  const mockData = createEmptyMockData();
  mockData.directoryPath = PARSERS_PATH;

  const mockApi = MockCreator.create(mockData, manager);

  const req = createRequest();
  const res = createStubResponse();

  await mockApi(req, res);

  t.true(res.status.calledOnce);
  t.is(res.status.args[0][0], 500);
  t.true(res.send.calledOnce);
});

test('yaml parser is should can use "query" condition', async (t) => {
  const manager = new TestMockManager();
  sinon.stub(manager, 'getParsers').returns({ current: 'parser-if-query.yml' });

  const mockData = createEmptyMockData();
  mockData.directoryPath = PARSERS_PATH;

  const mockApi = MockCreator.create(mockData, manager);

  const req = createRequest({
    query: {
      key1: 'value1',
      key2: 'value2',
    },
  });
  const res = createStubResponse();

  await mockApi(req, res);

  t.true(res.status.calledOnce);
  t.is(res.status.args[0][0], 200);

  t.true(res.send.calledOnce);
  t.is(res.send.args[0][0], 'match!!');
});

test('yaml parser is should use "query" condition as "and"', async (t) => {
  const manager = new TestMockManager();
  sinon.stub(manager, 'getParsers').returns({ current: 'parser-if-query.yml' });

  const mockData = createEmptyMockData();
  mockData.directoryPath = PARSERS_PATH;

  const mockApi = MockCreator.create(mockData, manager);

  const req = createRequest({
    query: {
      key1: 'value1',
    },
  });
  const res = createStubResponse();

  await mockApi(req, res);

  t.true(res.status.calledOnce);
  t.is(res.status.args[0][0], 500);

  t.true(res.send.calledOnce);
  t.is(res.send.args[0][0], 'test body');
});

test('yaml parser is should can use "params" condition', async (t) => {
  const manager = new TestMockManager();
  sinon.stub(manager, 'getParsers').returns({ current: 'parser-if-params.yml' });

  const mockData = createEmptyMockData();
  mockData.directoryPath = PARSERS_PATH;

  const mockApi = MockCreator.create(mockData, manager);

  const req = createRequest({
    params: {
      key1: 'value1',
      key2: 'value2',
    },
  });
  const res = createStubResponse();

  await mockApi(req, res);

  t.true(res.status.calledOnce);
  t.is(res.status.args[0][0], 200);

  t.true(res.send.calledOnce);
  t.is(res.send.args[0][0], 'match!!');
});

test('yaml parser is should use "params" condition as "and"', async (t) => {
  const manager = new TestMockManager();
  sinon.stub(manager, 'getParsers').returns({ current: 'parser-if-params.yml' });

  const mockData = createEmptyMockData();
  mockData.directoryPath = PARSERS_PATH;

  const mockApi = MockCreator.create(mockData, manager);

  const req = createRequest({
    params: {
      key1: 'value1',
    },
  });
  const res = createStubResponse();

  await mockApi(req, res);

  t.true(res.status.calledOnce);
  t.is(res.status.args[0][0], 500);

  t.true(res.send.calledOnce);
  t.is(res.send.args[0][0], 'test body');
});

test('yaml parser is should can use "body" condition', async (t) => {
  const manager = new TestMockManager();
  sinon.stub(manager, 'getParsers').returns({ current: 'parser-if-body.yml' });

  const mockData = createEmptyMockData();
  mockData.directoryPath = PARSERS_PATH;

  const mockApi = MockCreator.create(mockData, manager);

  const req = createRequest({
    body: {
      key1: 'value1',
      key2: 'value2',
    },
  });
  const res = createStubResponse();

  await mockApi(req, res);

  t.true(res.status.calledOnce);
  t.is(res.status.args[0][0], 200);

  t.true(res.send.calledOnce);
  t.is(res.send.args[0][0], 'match!!');
});

test('yaml parser is should use "body" condition as "and"', async (t) => {
  const manager = new TestMockManager();
  sinon.stub(manager, 'getParsers').returns({ current: 'parser-if-body.yml' });

  const mockData = createEmptyMockData();
  mockData.directoryPath = PARSERS_PATH;

  const mockApi = MockCreator.create(mockData, manager);

  const req = createRequest({
    body: {
      key1: 'value1',
    },
  });
  const res = createStubResponse();

  await mockApi(req, res);

  t.true(res.status.calledOnce);
  t.is(res.status.args[0][0], 500);

  t.true(res.send.calledOnce);
  t.is(res.send.args[0][0], 'test body');
});

test('yaml parser is should can use all conditions simultaneously', async (t) => {
  const manager = new TestMockManager();
  sinon.stub(manager, 'getParsers').returns({ current: 'parser-if-all.yml' });

  const mockData = createEmptyMockData();
  mockData.directoryPath = PARSERS_PATH;

  const mockApi = MockCreator.create(mockData, manager);

  const req = createRequest({
    query: { q1: 'q-value1' },
    params: { p1: 'p-value1' },
    body: { b1: 'b-value1' },
  });
  const res = createStubResponse();

  await mockApi(req, res);

  t.true(res.status.calledOnce);
  t.is(res.status.args[0][0], 200);

  t.true(res.send.calledOnce);
  t.is(res.send.args[0][0], 'match!!');
});

test('yaml parser is should use all condition as "and"', async (t) => {
  const manager = new TestMockManager();
  sinon.stub(manager, 'getParsers').returns({ current: 'parser-if-all.yml' });

  const mockData = createEmptyMockData();
  mockData.directoryPath = PARSERS_PATH;

  const mockApi = MockCreator.create(mockData, manager);

  const req = createRequest({
    query: { q1: 'q-value1' },
    params: { p1: 'p-value1' },
  });
  const res = createStubResponse();

  await mockApi(req, res);

  t.true(res.status.calledOnce);
  t.is(res.status.args[0][0], 500);

  t.true(res.send.calledOnce);
  t.is(res.send.args[0][0], 'test body');
});

test('yaml parser is should always match empty "if"', async (t) => {
  const manager = new TestMockManager();
  sinon.stub(manager, 'getParsers').returns({ current: 'parser-if-none-condition.yml' });

  const mockData = createEmptyMockData();
  mockData.directoryPath = PARSERS_PATH;

  const mockApi = MockCreator.create(mockData, manager);

  const req = createRequest({
    query: {
      key1: 'value1',
    },
  });
  const res = createStubResponse();

  await mockApi(req, res);

  t.true(res.status.calledOnce);
  t.is(res.status.args[0][0], 200);

  t.true(res.send.calledOnce);
  t.is(res.send.args[0][0], 'match!!');
});

test('yaml parser is should return 200 when "then" was undefined', async (t) => {
  const manager = new TestMockManager();
  sinon.stub(manager, 'getParsers').returns({ current: 'parser-if-none-then.yml' });

  const mockData = createEmptyMockData();
  mockData.directoryPath = PARSERS_PATH;

  const mockApi = MockCreator.create(mockData, manager);

  const req = createRequest({
    query: {
      key1: 'value1',
    },
  });
  const res = createStubResponse();

  await mockApi(req, res);

  t.true(res.status.calledOnce);
  t.is(res.status.args[0][0], 200);
  t.true(res.send.calledOnce);
});

test('yaml parser is should allow multiple "if" sections', async (t) => {
  const manager = new TestMockManager();
  sinon.stub(manager, 'getParsers').returns({ current: 'parser-multiple-if.yml' });

  const mockData = createEmptyMockData();
  mockData.directoryPath = PARSERS_PATH;

  const mockApi = MockCreator.create(mockData, manager);

  const req = createRequest({
    query: {
      key1: 'value2',
    },
  });
  const res = createStubResponse();

  await mockApi(req, res);

  t.true(res.status.calledOnce);
  t.is(res.status.args[0][0], 202);
});

test('yaml parser is should return 500 when not match conditions', async (t) => {
  const manager = new TestMockManager();
  sinon.stub(manager, 'getParsers').returns({ current: 'parser-not-match.yml' });

  const mockData = createEmptyMockData();
  mockData.directoryPath = PARSERS_PATH;

  const mockApi = MockCreator.create(mockData, manager);

  const req = createRequest({});
  const res = createStubResponse();

  await mockApi(req, res);

  t.true(res.status.calledOnce);
  t.is(res.status.args[0][0], 500);
});

test('yaml parser is should allow not array format', async (t) => {
  const manager = new TestMockManager();
  sinon.stub(manager, 'getParsers').returns({ current: 'parser-not-array.yml' });

  const mockData = createEmptyMockData();
  mockData.directoryPath = PARSERS_PATH;

  const mockApi = MockCreator.create(mockData, manager);

  const req = createRequest();
  const res = createStubResponse();

  await mockApi(req, res);

  t.true(res.status.calledOnce);
  t.is(res.status.args[0][0], 200);

  t.true(res.set.calledOnce);
  t.deepEqual(res.set.args[0][0], {
    'Content-Type': 'application/text',
  });

  t.true(res.send.calledOnce);
  t.is(res.send.args[0][0], 'test body');
});

function createEmptyMockData() {
  return {
    id: '',
    directoryPath: '',
    urlPath: '',
    method: '',
  };
}

function createRequest({ params, query, body } = {}) {
  return { params, query, body };
}

function createStubResponse() {
  return {
    status: sinon.stub().returnsThis(),
    set: sinon.stub().returnsThis(),
    send: sinon.stub().returnsThis(),
  };
}
