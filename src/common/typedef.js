/**
 * A mock API definition.
 *
 * @typedef {Object} MockApiDef
 * @property {string} id - The ID of mock.
 * @property {string} directoryPath - API definition directory path.
 * @property {string} urlPath - API URL path.
 * @property {string} method - API HTTP method.
 */

/**
 * All mock parsers.
 *
 * "current" and "user" are basically the same but set highest priority file to
 * "current" when "user" file is not exists.
 *
 * @typedef {Object} MockApiParsers
 * @property {string} current - The current parser file name.
 * @property {string} user - The user specified parser file name.
 * @property {string[]} parsers - All parser file names.
 */

/**
 * Server settings.
 *
 * @typedef {Object} ServerSettings
 * @property {ServerInfo} http - HTTP server information.
 * @property {ServerInfo} socket - WebSocket server information.
 */

/**
 * A server information.
 *
 * @typedef {Object} ServerInfo
 * @property {string} host - Server host name.
 * @property {number} port - Server port number.
 */

/**
 * User settings.
 *
 * @typedef {Object} UserSettings
 * @property {Object.<string, UserMockSetting>} api - API user settings.
 */

/**
 * API user UserSettings.
 *
 * @typedef {Object} UserMockSetting
 * @property {string} parser - Current parser file name.
 */

/**
 * A mock access log.
 *
 * @typedef {Object} MockLog
 * @property {MockRequestLog} req - A request log to mock.
 * @property {MockResponseLog} res - A response log to mock.
 */

/**
 * A request log to mock.
 *
 * @typedef {Object} MockRequestLog
 * @property {string} url - Request URL.
 * @property {string} method - Request method.
 * @property {Object.<string, string>} headers - Request headers.
 * @property {string} body - Request body.
 * @property {Date} datetime
 */

/**
 * A response log to mock.
 *
 * @typedef {Object} MockResponseLog
 * @property {number} statusCode - Response status code.
 * @property {Object.<string, string>} headers - Response headers.
 * @property {string} body - Response body.
 * @property {Date} datetime
 */
