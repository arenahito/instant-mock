import fsp from 'fs-promise';
import test from 'ava';
import path from 'path';
import yaml from 'js-yaml';
import del from 'del';

import { TestUserSettingsManager } from '../../../src/server/setting/user-settings-manager';

const SETTINGS_PATH = path.join(__dirname, 'user-settings');
const TMP_PATH = path.join(SETTINGS_PATH, 'tmp');

test.before(async () => {
  await del(TMP_PATH);
  await fsp.mkdir(TMP_PATH);
});

test.after(async () => {
  await del(TMP_PATH);
});

test('#getUserMockSetting is should return default settings when settings file was not loaded', (t) => {
  const manager = new TestUserSettingsManager();

  t.deepEqual(
        manager.getUserMockSetting('/xxx/yyy', '@get'),
        { parser: 'parser-default.yml' }
    );
});

test('#getUserMockSetting is should return loaded settings when settings file was loaded', (t) => {
  const settingsPath = path.join(SETTINGS_PATH, 'user.yml');
  const manager = new TestUserSettingsManager(settingsPath);
  manager.loadSync();

  t.deepEqual(
        manager.getUserMockSetting('/users', 'get'),
        { parser: 'parser-a.yml' }
    );
  t.deepEqual(
        manager.getUserMockSetting('/users/:id', 'get'),
        { parser: 'parser-b.yml' }
    );
});

test('#getUserMockSetting is should match lower path when uppper path in settings', (t) => {
  const settingsPath = path.join(SETTINGS_PATH, 'user-ignorecase.yml');
  const manager = new TestUserSettingsManager(settingsPath);
  manager.loadSync();

  t.deepEqual(
        manager.getUserMockSetting('/uppercase', 'GET'),
        { parser: 'parser-upper-case.yml' }
    );
});

test('#getUserMockSetting is should match lower method when uppper method in settings', (t) => {
  const settingsPath = path.join(SETTINGS_PATH, 'user-ignorecase.yml');
  const manager = new TestUserSettingsManager(settingsPath);
  manager.loadSync();

  t.deepEqual(
        manager.getUserMockSetting('/UPPERCASE', 'get'),
        { parser: 'parser-upper-case.yml' }
    );
});

test(' #getUserMockSetting is should match uppper path when lower path in settings', (t) => {
  const settingsPath = path.join(SETTINGS_PATH, 'user-ignorecase.yml');
  const manager = new TestUserSettingsManager(settingsPath);
  manager.loadSync();

  t.deepEqual(
        manager.getUserMockSetting('/LOWERCASE', 'get'),
        { parser: 'parser-lower-case.yml' }
    );
});

test('#getUserMockSetting is should match uppper method when lower method in settings', (t) => {
  const settingsPath = path.join(SETTINGS_PATH, 'user-ignorecase.yml');
  const manager = new TestUserSettingsManager(settingsPath);
  manager.loadSync();

  t.deepEqual(
        manager.getUserMockSetting('/lowercase', 'GET'),
        { parser: 'parser-lower-case.yml' }
    );
});

test('#saveUserMockSetting is should write setting to file', async (t) => {
  const settingsPath = path.join(TMP_PATH, 'test.yml');
  const manager = new TestUserSettingsManager(settingsPath);
  manager.loadSync();
  await manager.saveUserMockSetting('/path/to/api1', 'GET', { parser: 'dummy1.yml' });
  await manager.saveUserMockSetting('/path/to/api2', 'POST', { parser: 'dummy2.yml' });

  const file = await fsp.readFile(settingsPath);
  const parsedFile = yaml.safeLoad(file);

  t.deepEqual(
    parsedFile,
    { api: {
      '/path/to/api1/@get': { parser: 'dummy1.yml' },
      '/path/to/api2/@post': { parser: 'dummy2.yml' },
    } }
    );
});

