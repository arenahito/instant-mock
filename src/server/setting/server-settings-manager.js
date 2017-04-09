/** @module */

import _ from 'lodash';
import yaml from 'js-yaml';
import fs from 'fs';

import Constants from '../constants';
import Logger from '../logger';

/**
 * Server settings management class.
 */
class ServerSettingsManager {

  /**
   * Create a server settings manager.
   *
   * @param {string} [settingsPath=Constants.USER_SETTINGS_PATH]
   *    - A server settings file path.
   */
  constructor(settingsPath = Constants.SERVER_SETTINGS_PATH) {
    this._settingsPath = settingsPath;
    this._settings = this._generateDefault();
  }

  /**
   * Load settings from file.
   */
  loadSync() {
    if (fs.existsSync(this._settingsPath)) {
      this._settings = _.merge(
        this._generateDefault(),
        yaml.safeLoad(fs.readFileSync(this._settingsPath))
      );
    }
    Logger.dir(this._settings);
  }

  /**
   * Get a loaded server settings.
   *
   * @returns {ServerSettings} Server settings.
   */
  getSettings() {
    return _.cloneDeep(this._settings);
  }

  /**
   * Generate default server settings.
   *
   * @private
   * @returns {ServerSettings} Generated server settings.
   */
  _generateDefault() {
    return {
      http: {
        host: 'localhost',
        port: 3000,
      },
      socket: {
        host: 'localhost',
        port: 3010,
      },
    };
  }

}

// Export singleton class for test.
export const TestServerSettingsManager = ServerSettingsManager;

/** The only ServerSettingsManager instance. */
export default new ServerSettingsManager();
