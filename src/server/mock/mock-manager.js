/** @module */

import _ from 'lodash';
import path from 'path';
import fs from 'fs';
import glob from 'glob';
import sha from 'sha.js';

import MockCreator from './mock-creator';
import Constants from '../constants';
import Logger from '../logger';
import UserSettingsManager from '../setting/user-settings-manager';

/**
 * Mock management class.
 */
class MockManager {

  /**
   * Create the mock manager.
   *
   * @param {string} [mockPath=Constants.MOCK_PATH]
   *        - A mock definition files directory path.
   * @param {UserSettingsManager} [userSettingsManager=UserSettingsManager]
   *        - The user settings manager.
   */
  constructor(
    mockPath = Constants.MOCK_PATH,
    userSettingsManager = UserSettingsManager) {
    this._mockPath = mockPath;
    this._mocks = [];
    this._userSettingsManager = userSettingsManager;
  }

  /**
   * Load all mock definitions and set routes.
   *
   * @param {Application} app - The Express.js application.
   */
  loadSync(app) {
    try {
      Logger.info(`Load apis from ${this._mockPath}`);

      this._mocks = this._findAllApisSync(this._mockPath);

      this._mocks.forEach((api) => {
        Logger.info(`Add route: ${api.urlPath} - ${api.method}`);
        this._registerRoute(app, api, MockCreator.create(api));
      });
    } catch (e) {
      Logger.error(e);
      this._mocks = [];
    }
  }

  /**
   * Get all loaded mock definitions.
   *
   * @returns {Array.<{mock: MockApiDef, parsers: MockApiParsers}}
   *          All loaded APIs.
   */
  getMocks() {
    return _.cloneDeep(this._mocks);
  }

  /**
   * Get all loaded mock definition and all parsers.
   *
   * @returns {Promise.<Array.<{mock: MockApiDef, parsers: MockApiParsers}>>}
   *          A Promise for getting mocks and parsers.
   */
  async getMocksWithParsers() {
    const parsersGetter = this._mocks.map(mock => this.getParsers(mock.id));
    const parsersList = await Promise.all(parsersGetter);

    return this._mocks.map((mock, index) => (
      { mock, parsers: parsersList[index] }
    ));
  }

  /**
   * Get all parsers.
   *
   * @param {string} id - The ID of mock.
   * @returns {Promise.<MockApiParsers>} A Promise for getting mock parsers.
   */
  async getParsers(id) {
    const mock = _.find(this._mocks, { id });
    if (!mock) {
      throw new Error(`Could not find mock definition. [id=${id}]`);
    }
    const settings = this._userSettingsManager.getUserMockSetting(
      mock.urlPath,
      mock.method
    );
    return this._getParserFilesFromDirectory(
      mock.directoryPath,
      settings.parser
    );
  }

  /**
   * Update current parser file.
   *
   * @param {string} id - Mock ID.
   * @param {string} parserFileName - New parser file name.
   * @returns {Promise} A Promise for updating the current parser file.
   */
  async updateCurrentParser(id, parserFileName) {
    const mock = _.find(this._mocks, { id });
    if (!mock) {
      throw new Error(`Could not find mock definition. [id=${id}]`);
    }

    const parserFilePath = path.join(mock.directoryPath, parserFileName);
    if (!fs.existsSync(parserFilePath)) {
      throw new Error(`Could not found specified parser file. [file=${parserFilePath}]`);
    }

    const setting = this._userSettingsManager.getUserMockSetting(
      mock.urlPath,
      mock.method
    );
    setting.parser = parserFileName;

    await this._userSettingsManager.saveUserMockSetting(
      mock.urlPath,
      mock.method,
      setting
    );
  }

  /**
   * Find all mock definitions from directory.
   *
   * @private
   * @param {string} rootPath - API data root directory path.
   * @param {string} [parentPath] - API data directory path.
   * @param {string} [childName] - API data child directory name.
   * @returns {MockApiDef[]} All API definition.
   */
  _findAllApisSync(rootPath, parentPath = rootPath, childName) {
    if (this._isMethodDirectory(childName)) {
      const normalizedPath = parentPath
        .replace(rootPath, '')
        .replace(/\\/g, '/')
        .replace(/\/\$/g, '/:');
      const urlPath = `/mock${normalizedPath}`;

      const method = this._removeSpecialCharactor(childName)
        .toUpperCase();

      return [{
        id: this._generateId(urlPath, method),
        directoryPath: path.join(parentPath, childName),
        urlPath,
        method,
      }];
    }

    const currentPath = childName ? path.join(parentPath, childName) : parentPath;
    return _.flatMap(fs.readdirSync(currentPath), (dirName) => {
      if (fs.statSync(path.join(currentPath, dirName)).isDirectory()) {
        return this._findAllApisSync(rootPath, currentPath, dirName);
      }
      return [];
    });
  }

  /**
   * Confirm specified diretory is method-directory or not.
   *
   * @private
   * @param {string} [directoryPath] - Directory path.
   * @returns {boolean} If directory path is method-directory then return true.
   */
  _isMethodDirectory(directoryPath) {
    return directoryPath && directoryPath.startsWith('@');
  }

  /**
   * Remove special charactor from directory name.
   *
   * @private
   * @param {string} directoryName - Directory name.
   * @returns {string} Converted directory name.
   */
  _removeSpecialCharactor(directoryName) {
    return directoryName.substr(1);
  }

  _generateId(url, method) {
    return sha('sha1').update(`${url}@${method}`).digest('base64');
  }

  /**
   * Register the API route.
   *
   * @private
   * @param {Application} app - Express.js app.
   * @param {MockApiDef} api - API definition.
   * @param {Function} callback - API function.
   */
  _registerRoute(app, api, callback) {
    switch (api.method) {
      case 'GET':
        app.get(api.urlPath, callback);
        break;
      case 'PUT':
        app.put(api.urlPath, callback);
        break;
      case 'POST':
        app.post(api.urlPath, callback);
        break;
      case 'PATCH':
        app.patch(api.urlPath, callback);
        break;
      case 'DELETE':
        app.delete(api.urlPath, callback);
        break;
      default:
        Logger.warn(`Unsupported method [urlPath=${api.urlPath}, method=${api.method}]`);
    }
  }

  /**
   * Get parser file names.
   *
   * Confirm exists parser file and set it file path to "current".
   * If it not exists then find other parser file.
   *
   * Parser file priority:
   * 1. parser-default.js
   * 2. parser-default.yml
   * 3. parser-A.js
   * 4. parser-A.yml
   * 5. parser-B.js
   * 6. parser-B.yml
   *
   * @private
   * @param {string} directoryPath - A directory path of parser file.
   * @param {string} parserFileName - A parser file name.
   * @returns {Promise.<MockApiParsers>} A Promise for getting the parser file name.
   */
  _getParserFilesFromDirectory(directoryPath, parserFileName) {
    return new Promise((resolve, reject) => {
      glob(
        path.join(directoryPath, `${Constants.PARSER_FILE_PREFIX}*.@(js|yml)`),
        { nodir: true },
        (err, matches) => {
          if (err) {
            reject(err);
          } else if (matches.length === 0) {
            reject(new Error('Parser file was not found.'));
          } else {
            resolve(this._getParserFileFromFileList(
              directoryPath,
              matches,
              parserFileName
            ));
          }
        }
      );
    });
  }

  /**
   * Get parser file from list.
   *
   * Return specified parser file but if not exists then return highest
   * priority parser file.
   *
   * @param {string} directoryPath - Parser files directory path.
   * @param {string[]} files - All parser files.
   * @param {string} parserFileName - Selected parser file.
   */
  _getParserFileFromFileList(directoryPath, files, parserFileName) {
    if (fs.existsSync(path.join(directoryPath, parserFileName))) {
      return {
        current: parserFileName,
        user: parserFileName,
        parsers: files.map(f => path.basename(f)),
      };
    }
    return {
      current: this._getHighestPriorityParserFile(
        files.map(f => path.basename(f))
      ),
      user: parserFileName,
      parsers: files.map(f => path.basename(f)),
    };
  }

  /**
   * Get a highest priority parser file from parser file list.
   *
   * @private
   * @param {string[]} files - Parser file list.
   * @returns {string} A highest priority parser file.
   */
  _getHighestPriorityParserFile(files) {
    if (files.some(v => v === `${Constants.PARSER_FILE_PREFIX}default.js`)) {
      return `${Constants.PARSER_FILE_PREFIX}default.js`;
    } else if (files.some(v => v === `${Constants.PARSER_FILE_PREFIX}default.yml`)) {
      return `${Constants.PARSER_FILE_PREFIX}default.yml`;
    }
    return files.sort()[0];
  }
}

// Export singleton class for test.
export const TestMockManager = MockManager;

/** The only MockManager instance. */
export default new MockManager();
