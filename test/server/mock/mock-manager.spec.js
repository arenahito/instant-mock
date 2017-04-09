import path from 'path';
import test from 'ava';
import sinon from 'sinon';
import express from 'express';
import sha from 'sha.js';

import { TestMockManager, __RewireAPI__ as MockManagerRewireAPI } from '../../../src/server/mock/mock-manager';

import { TestUserSettingsManager } from '../../../src/server/setting/user-settings-manager';

const MOCK_PATH = path.join(__dirname, 'mocks');

test('#loadSync is should success when not exists mock directory', () => {
  const manager = new TestMockManager('nod-found');
  const app = express();
  manager.loadSync(app);
});

test('#loadSync is should register mock apis for each methods when lowercase method path', (t) => {
  const app = createAppMock();

  const manager = new TestMockManager(path.join(MOCK_PATH, 'methods-lowercase'));
  manager.loadSync(app);

  t.true(app.get.calledOnce);
  t.is(app.get.args[0][0], '/mock/test');

  t.true(app.put.calledOnce);
  t.is(app.put.args[0][0], '/mock/test');

  t.true(app.post.calledOnce);
  t.is(app.post.args[0][0], '/mock/test');

  t.true(app.patch.calledOnce);
  t.is(app.patch.args[0][0], '/mock/test');

  t.true(app.delete.calledOnce);
  t.is(app.delete.args[0][0], '/mock/test');
});

test('#loadSync is should register mock apis for each methods when uppercase method path', (t) => {
  const app = createAppMock();

  const manager = new TestMockManager(path.join(MOCK_PATH, 'methods-uppercase'));
  manager.loadSync(app);

  t.true(app.get.calledOnce);
  t.is(app.get.args[0][0], '/mock/test');

  t.true(app.put.calledOnce);
  t.is(app.put.args[0][0], '/mock/test');

  t.true(app.post.calledOnce);
  t.is(app.post.args[0][0], '/mock/test');

  t.true(app.patch.calledOnce);
  t.is(app.patch.args[0][0], '/mock/test');

  t.true(app.delete.calledOnce);
  t.is(app.delete.args[0][0], '/mock/test');
});

test('#loadSync is should register mock apis when method path was nested', (t) => {
  const app = createAppMock();
  const manager = new TestMockManager(path.join(MOCK_PATH, 'nested'));
  manager.loadSync(app);

  t.is(app.post.callCount, 3);
  t.is(app.post.args[0][0], '/mock/test1');
  t.is(app.post.args[1][0], '/mock/test1/test2');
  t.is(app.post.args[2][0], '/mock/test1/test2/test3');
});

test('#loadSync is should register mock api when parameter was included in path', (t) => {
  const app = createAppMock();
  const manager = new TestMockManager(path.join(MOCK_PATH, 'path-params'));
  manager.loadSync(app);

  t.is(app.delete.callCount, 1);
  t.is(app.delete.args[0][0], '/mock/test/:id');
});

test('#loadSync is should not throw error when invalid method', (t) => {
  const app = express();
  const manager = new TestMockManager(path.join(MOCK_PATH, 'invalid-method'));
  t.notThrows(() => { manager.loadSync(app); });
});

test('#loadSync is should not throw error when empty', (t) => {
  const app = express();
  const manager = new TestMockManager(path.join(MOCK_PATH, 'empty-mock'));
  t.notThrows(() => { manager.loadSync(app); });
});

test('#getMocks is should return all loaded mocks', (t) => {
  const app = express();
  const manager = new TestMockManager(path.join(MOCK_PATH, 'mocks-with-parsers'));
  manager.loadSync(app);
  const mocks = manager.getMocks();

  t.deepEqual(mocks, [
    {
      id: generateId('/mock/test', 'DELETE'),
      directoryPath: path.join(MOCK_PATH, 'mocks-with-parsers/test/@delete'),
      urlPath: '/mock/test',
      method: 'DELETE',
    },
    {
      id: generateId('/mock/test', 'POST'),
      directoryPath: path.join(MOCK_PATH, 'mocks-with-parsers/test/@post'),
      urlPath: '/mock/test',
      method: 'POST',
    },
  ]);
});

test('#getMocksWithParsers is should return all loaded mocks with parsers', async (t) => {
  const app = express();
  const manager = new TestMockManager(path.join(MOCK_PATH, 'mocks-with-parsers'));
  manager.loadSync(app);
  const mocks = await manager.getMocksWithParsers();

  t.deepEqual(mocks, [
    {
      mock: {
        id: generateId('/mock/test', 'DELETE'),
        directoryPath: path.join(MOCK_PATH, 'mocks-with-parsers/test/@delete'),
        urlPath: '/mock/test',
        method: 'DELETE',
      },
      parsers: {
        current: 'parser-default.yml',
        user: 'parser-default.yml',
        parsers: ['parser-a.yml', 'parser-default.yml'],
      },
    }, {
      mock: {
        id: generateId('/mock/test', 'POST'),
        directoryPath: path.join(MOCK_PATH, 'mocks-with-parsers/test/@post'),
        urlPath: '/mock/test',
        method: 'POST',
      },
      parsers: {
        current: 'parser-default.yml',
        user: 'parser-default.yml',
        parsers: ['parser-a.yml', 'parser-default.yml'],
      },
    },
  ]);
});

test('#getParsers is should throw error when specified id was invalid', (t) => {
  const app = express();
  const manager = new TestMockManager(path.join(MOCK_PATH, 'mocks-with-parsers'));
  manager.loadSync(app);
  t.throws(manager.getParsers('invalid-id'));
});

test('#getParsers is should return parser-default.js as current, when current parser is not exists and exists parser-default.yml', async (t) => {
  const userSettingsManager = new TestUserSettingsManager();
  sinon.stub(userSettingsManager, 'getUserMockSetting').returns({
    parser: 'not-found',
  });

  const manager = new TestMockManager(
    path.join(MOCK_PATH, 'priority'),
    userSettingsManager
  );

  const app = express();
  manager.loadSync(app);

  const parsers = await manager.getParsers(generateId('/mock/priority1', 'POST'));

  t.is(parsers.current, 'parser-default.js');
  t.is(parsers.user, 'not-found');
});

test('#getParsers is should return parser-default.yml as current, when current parser is not exists and exists parser-a.js', async (t) => {
  const userSettingsManager = new TestUserSettingsManager();
  sinon.stub(userSettingsManager, 'getUserMockSetting').returns({
    parser: 'not-found',
  });

  const manager = new TestMockManager(
    path.join(MOCK_PATH, 'priority'),
    userSettingsManager
  );

  const app = express();
  manager.loadSync(app);

  const parsers = await manager.getParsers(generateId('/mock/priority2', 'POST'));

  t.is(parsers.current, 'parser-default.yml');
  t.is(parsers.user, 'not-found');
});

test('#getParsers is should return parser-a.js as current, when current parser is not exists and exists parser-a.yml', async (t) => {
  const userSettingsManager = new TestUserSettingsManager();
  sinon.stub(userSettingsManager, 'getUserMockSetting').returns({
    parser: 'not-found',
  });

  const manager = new TestMockManager(
    path.join(MOCK_PATH, 'priority'),
    userSettingsManager
  );

  const app = express();
  manager.loadSync(app);

  const parsers = await manager.getParsers(generateId('/mock/priority3', 'POST'));

  t.is(parsers.current, 'parser-a.js');
  t.is(parsers.user, 'not-found');
});

test('#getParsers is should return parser-a.yml as current, when current parser is not exists and exists parser-b.js', async (t) => {
  const userSettingsManager = new TestUserSettingsManager();
  sinon.stub(userSettingsManager, 'getUserMockSetting').returns({
    parser: 'not-found',
  });

  const manager = new TestMockManager(
    path.join(MOCK_PATH, 'priority'),
    userSettingsManager
  );

  const app = express();
  manager.loadSync(app);

  const parsers = await manager.getParsers(generateId('/mock/priority4', 'POST'));

  t.is(parsers.current, 'parser-a.yml');
  t.is(parsers.user, 'not-found');
});

test('#getParsers is should throw error when parser was not found', (t) => {
  const app = express();
  const manager = new TestMockManager(path.join(MOCK_PATH, 'empty-parser'));
  manager.loadSync(app);

  t.throws(manager.getParsers(generateId('/mock/test', 'POST')));
});

test.serial('#getParsers is should throw error when "glob" was failed', (t) => {
  MockManagerRewireAPI.__set__('glob', (pattern, options, cb) => {
    cb(new Error());
  });

  const app = express();
  const manager = new TestMockManager(path.join(MOCK_PATH, 'mocks-with-parsers'));
  manager.loadSync(app);

  t.throws(manager.getParsers(generateId('/mock/test', 'POST')));

  MockManagerRewireAPI.__ResetDependency__('glob');
});

test('#updateCurrentParser is should throw error when invalid id', (t) => {
  const manager = new TestMockManager(path.join(MOCK_PATH, 'mocks-with-parsers'));
  manager.loadSync(express());

  t.throws(manager.updateCurrentParser('invalid-id', 'parser-default.yml'));
});

test('#updateCurrentParser is should throw error when specified file was not exists', (t) => {
  const manager = new TestMockManager(path.join(MOCK_PATH, 'mocks-with-parsers'));
  manager.loadSync(express());

  t.throws(manager.updateCurrentParser(generateId('/mock/test', 'POST'), 'not-found'));
});

test('#updateCurrentParser is should call UserSettingsManager#saveUserMockSetting when correct parameters', async (t) => {
  const userSettingsManager = new TestUserSettingsManager();
  sinon.spy(userSettingsManager, 'saveUserMockSetting');

  const manager = new TestMockManager(
    path.join(MOCK_PATH, 'mocks-with-parsers'),
    userSettingsManager
  );

  manager.loadSync(express());

  await manager.updateCurrentParser(generateId('/mock/test', 'POST'), 'parser-a.yml');

  t.true(userSettingsManager.saveUserMockSetting.calledOnce);
  t.is(userSettingsManager.saveUserMockSetting.args[0][0], '/mock/test');
  t.is(userSettingsManager.saveUserMockSetting.args[0][1], 'POST');
  t.is(userSettingsManager.saveUserMockSetting.args[0][2].parser, 'parser-a.yml');
});

function generateId(url, method) {
  return sha('sha1').update(`${url}@${method}`).digest('base64');
}

function createAppMock() {
  return {
    get: sinon.stub(),
    put: sinon.stub(),
    post: sinon.stub(),
    patch: sinon.stub(),
    delete: sinon.stub(),
  };
}
