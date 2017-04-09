import test from 'ava';
import sinon from 'sinon';
import EventEmitter from 'events';

import MockLogManager, { TestMockLogManager } from '../../../src/server/mock/mock-log-manager';

test('parser middleware is should set request date-time to datetime field', (t) => {
  const req = new EventEmitter();
  const res = new EventEmitter();
  res.finished = false;

  const parser = MockLogManager.parser();
  parser(req, res, sinon.stub());

  req.emit('end');

  t.true(req.datetime instanceof Date);
});

test('parser middleware is should set request body to raw-body field', (t) => {
  const req = new EventEmitter();
  const res = new EventEmitter();
  res.finished = false;

  const parser = MockLogManager.parser();
  parser(req, res, sinon.stub());

  req.emit('data', 'chunk1');
  req.emit('data', 'chunk2');
  req.emit('data', 'chunk3');
  req.emit('end');

  t.is(req.rawBody, 'chunk1chunk2chunk3');
});

test('parser middleware is should override send method, it can set response date-time to datetime field', (t) => {
  const req = new EventEmitter();
  const res = new EventEmitter();
  res.finished = false;
  res.send = () => {};

  const parser = MockLogManager.parser();
  parser(req, res, sinon.stub());

  res.send();

  t.true(res.datetime instanceof Date);
});

test('parser middleware is should override send method, it can capture body when not empty', (t) => {
  const req = new EventEmitter();
  const res = new EventEmitter();
  res.finished = false;
  res.send = () => {};

  const parser = MockLogManager.parser();
  parser(req, res, sinon.stub());

  res.send({ f1: 'val1', f2: 'val2' });

  t.is(res.body, { f1: 'val1', f2: 'val2' }.toString());
});

test('parser middleware is should override send method, it set empty string to body field when response body is empty', (t) => {
  const req = new EventEmitter();
  const res = new EventEmitter();
  res.finished = false;
  res.send = () => {};

  const parser = MockLogManager.parser();
  parser(req, res, sinon.stub());

  res.send();

  t.is(res.body, '');
});

test('parser middleware is should watch response finished and not save req/res log when response error', (t) => {
  const req = new EventEmitter();
  const res = new EventEmitter();
  res.finished = false;

  const manager = new TestMockLogManager();
  const parser = manager.parser();
  parser(req, res, sinon.stub());

  const socket = new EventEmitter();
  res.emit('socket', socket);
  socket.emit('error', new Error());

  t.is(manager.getLogs().length, 0);
});

test('parser middleware is should watch response finished and save req/res log', (t) => {
  const req = new EventEmitter();
  const res = new EventEmitter();
  res.finished = false;

  const manager = new TestMockLogManager();
  const parser = manager.parser();
  parser(req, res, sinon.stub());

  res.req = {
    url: '/path/to/api',
    method: 'GET',
    headers: {
      key1: 'value1',
      key2: 'value2',
    },
    rawBody: 'raw body',
    datetime: new Date(),
  };
  res.statusCode = 200;
  res.getHeaders = sinon.stub();
  res.getHeaders.returns({
    key1: 'value1',
    key2: 'value2',
  });
  res.datetime = new Date();

  res.emit('finish');

  t.deepEqual(manager.getLogs()[0].req, {
    url: res.req.url,
    method: res.req.method,
    headers: res.req.headers,
    body: res.req.rawBody,
    datetime: res.req.datetime,
  });
  t.deepEqual(manager.getLogs()[0].res, {
    statusCode: res.statusCode,
    headers: {
      key1: 'value1',
      key2: 'value2',
    },
    body: res.body,
    datetime: res.datetime,
  });
});

test('parser middleware is should watch response finished and emit req/res log', (t) => {
  const req = new EventEmitter();
  const res = new EventEmitter();
  res.finished = false;

  const manager = new TestMockLogManager();
  const parser = manager.parser();
  parser(req, res, sinon.stub());

  res.req = {
    url: '/path/to/api',
    method: 'GET',
    headers: {
      key1: 'value1',
      key2: 'value2',
    },
    rawBody: 'raw body',
    datetime: new Date(),
  };
  res.statusCode = 200;
  res.getHeaders = sinon.stub();
  res.getHeaders.returns({
    key1: 'value1',
    key2: 'value2',
  });
  res.datetime = new Date();

  const spy = sinon.spy();
  manager.on('add', spy);
  res.emit('finish');

  t.true(spy.calledOnce);

  t.deepEqual(spy.args[0][0].req, {
    url: res.req.url,
    method: res.req.method,
    headers: res.req.headers,
    body: res.req.rawBody,
    datetime: res.req.datetime,
  });
  t.deepEqual(spy.args[0][0].res, {
    statusCode: res.statusCode,
    headers: {
      key1: 'value1',
      key2: 'value2',
    },
    body: res.body,
    datetime: res.datetime,
  });
});

test('parser middleware is should watch response finished and remove old log', (t) => {
  const req = new EventEmitter();
  const res = new EventEmitter();
  res.finished = false;

  const manager = new TestMockLogManager(2);
  const parser = manager.parser();
  parser(req, res, sinon.stub());

  res.req = {
    url: '/path/to/api',
    method: 'GET',
    headers: {
      key1: 'value1',
      key2: 'value2',
    },
    rawBody: 'raw body',
    datetime: new Date(),
  };
  res.statusCode = 200;
  res.getHeaders = sinon.stub();
  res.getHeaders.returns({
    key1: 'value1',
    key2: 'value2',
  });
  res.datetime = new Date();

  res.emit('finish');

  res.finished = false;
  res.statusCode = 201;
  parser(req, res, sinon.stub());
  res.emit('finish');

  res.finished = false;
  res.statusCode = 202;
  parser(req, res, sinon.stub());
  res.emit('finish');

  t.is(manager.getLogs().length, 2);
  t.is(manager.getLogs()[0].res.statusCode, 202);
  t.is(manager.getLogs()[1].res.statusCode, 201);
});

test('parser middleware is should call "next" function', (t) => {
  const req = new EventEmitter();
  const res = new EventEmitter();
  res.finished = false;

  const next = sinon.stub();

  const parser = MockLogManager.parser();
  parser(req, res, next);

  t.true(next.calledOnce);
});
