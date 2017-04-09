/** @module */

import fs from 'fs';
import path from 'path';

const ROOT_PATH = fs.realpathSync('./');
const MOCK_PATH = path.join(ROOT_PATH, 'mock');
const SERVER_SETTINGS_PATH = path.join(ROOT_PATH, 'server.yml');
const USER_SETTINGS_PATH = path.join(ROOT_PATH, 'user.yml');
const PARSER_FILE_PREFIX = 'parser-';
const DEFAULT_API_PARSER_FILE = `${PARSER_FILE_PREFIX}default.yml`;

export default {
  /** The path of API data directory. */
  MOCK_PATH,

  /** The path of server settings file. */
  SERVER_SETTINGS_PATH,

  /** The path of user settings file. */
  USER_SETTINGS_PATH,

  /** Parser file prefix. */
  PARSER_FILE_PREFIX,

  /** Default API parser file name. */
  DEFAULT_API_PARSER_FILE,
};
