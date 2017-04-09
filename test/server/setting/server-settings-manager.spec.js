import test from 'ava';
import path from 'path';

import { TestServerSettingsManager } from '../../../src/server/setting/server-settings-manager';

const SETTINGS_PATH = path.join(__dirname, 'server-settings');

test('#load is should generate default settings when settings file was not present', (t) => {
  const manager = new TestServerSettingsManager();
  manager.loadSync('not-found');

  t.deepEqual(
    manager.getSettings(),
    {
      http: { host: 'localhost', port: 3000 },
      socket: { host: 'localhost', port: 3010 },
    }
  );
});

test('#load is should load settings when settings file is present', (t) => {
  const settingsPath = path.join(SETTINGS_PATH, 'server-full.yml');
  const manager = new TestServerSettingsManager(settingsPath);
  manager.loadSync();

  t.deepEqual(
    manager.getSettings(),
    {
      http: { host: '1.2.3.4', port: 1234 },
      socket: { host: '10.20.30.40', port: 9876 },
    }
  );
});

// test('#load is should set default host when not included in settings file', (t) => {
//   const settingsPath = path.join(SETTINGS_PATH, 'server-no-host.yml');
//   const manager = new TestServerSettingsManager(settingsPath);
//   manager.loadSync();

//   t.deepEqual(
//     manager.getSettings(),
//     { host: 'localhost', port: 1234 }
//   );
// });

// test('#load is should set default port when not included in settings file', (t) => {
//   const settingsPath = path.join(SETTINGS_PATH, 'server-no-port.yml');
//   const manager = new TestServerSettingsManager(settingsPath);
//   manager.loadSync();

//   t.deepEqual(
//     manager.getSettings(),
//     { host: '1.2.3.4', port: 3000 }
//   );
// });

test('#getSettings is should return default settings when not loaded', (t) => {
  const manager = new TestServerSettingsManager();

  t.deepEqual(
    manager.getSettings(),
    {
      http: { host: 'localhost', port: 3000 },
      socket: { host: 'localhost', port: 3010 },
    }
  );
});
