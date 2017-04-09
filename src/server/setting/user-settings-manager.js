/** @module */

import _ from 'lodash';
import yaml from 'js-yaml';
import fs from 'fs';
import fsp from 'fs-promise';

import Constants from '../constants';
import Logger from '../logger';

/**
 * User settings management class.
 */
class UserSettingsManager {

  /**
   * Create a user settings manager.
   *
   * @param {string} [settingsPath=Constants.USER_SETTINGS_PATH]
   *        - A user settings file path.
   */
  constructor(settingsPath = Constants.USER_SETTINGS_PATH) {
    this._settingsPath = settingsPath;
    this._settings = this._generateDefault();
  }

  /**
   * Load settings from file.
   */
  loadSync() {
    if (fs.existsSync(this._settingsPath)) {
      this._settings = this._normalizeSettings(_.merge(
        this._generateDefault(),
        yaml.safeLoad(fs.readFileSync(this._settingsPath))
      ));
    }
    Logger.dir(this._settings);
  }

  /**
   * Save a mock user settings to the file.
   *
   * @param {string} urlPath - API URL path.
   * @param {string} method - API HTTP method.
   * @param {UserMockSetting} setting - API user setting.
   * @returns {Promise} A promise for saving API user settings to the file.
   */
  async saveUserMockSetting(urlPath, method, setting) {
    this._settings.api[this._generateUserMockSettingKey(urlPath, method)] =
      _.cloneDeep(setting);
    await this._save();
  }

  /**
   * Save current settings to the file.
   *
   * @private
   * @returns {Promise} A promise for saving to the file.
   */
  _save() {
    return fsp.writeFile(
      this._settingsPath,
      yaml.safeDump(this._settings)
    );
  }

  /**
   * Get a mock setting.
   *
   * @param {string} urlPath - Mock URL path.
   * @param {string} method - Mock method.
   * @returns {UserMockSetting} A API user setting.
   */
  getUserMockSetting(urlPath, method) {
    const key = this._generateUserMockSettingKey(urlPath, method);
    if (_.has(this._settings.api, key)) {
      return _.merge(
        this._generateUserMockDefault(),
        this._settings.api[key]
      );
    }
    return this._generateUserMockDefault();
  }

  _normalizeSettings(settings) {
    const newSettings = _.cloneDeep(settings);
    newSettings.api = _.mapKeys(
      newSettings.api,
      (value, key) => key.toLowerCase()
    );
    return newSettings;
  }

  /**
   * Generate default user settings.
   *
   * @private
   * @returns {Object} Generated user settings.
   */
  _generateDefault() {
    return {
      api: {},
    };
  }

  _generateUserMockSettingKey(urlPath, method) {
    return `${urlPath}/@${method}`.toLowerCase();
  }

  _generateUserMockDefault() {
    return {
      parser: Constants.DEFAULT_API_PARSER_FILE,
    };
  }

}

// Export singleton class for test.
export const TestUserSettingsManager = UserSettingsManager;

/** The only ServerSettingsManager instance. */
export default new UserSettingsManager();
