/** @module */

import _ from 'lodash';
import fsp from 'fs-promise';
import path from 'path';
import yaml from 'js-yaml';

import Logger from '../logger';
import MockManager from '../mock/mock-manager';

/**
 * HTTP request parsed data.
 *
 * @typedef {Object} module:mock-creator.ParseResult
 * @property {number} [status] - A HTTP response status.
 * @property {Object} [headers] - HTTP headers key-values.
 * @property {string} [body] - A response body file path.
 * @property {string} [rawBody] - Response body text. Ignore if "body" is set.
 */

/**
 * The condition for parse a HTTP request.
 *
 * @typedef {Object} module:mock-creator.ParserCondition
 * @property {module:mock-creator.ParserConditionIf} [if]
 * @property {module:mock-creator.ParserConditionThen} then
 */

/**
 * The "if" group of parser condition.
 *
 * @typedef {Object} module:mock-creator.ParserConditionIf
 * @property {Object} [params] Conditions for path parameters.
 * @property {Object} [query] Conditioins for query.
 * @property {Object} [body] Conditons for parsed body.
 */

/**
 * The "then" group of parser condition.
 *
 * @typedef {Object} module:mock-creator.ParserConditionThen
 * @property {Object} [status] A HTTP response status.
 * @property {Object} [headers] HTTP headers key-values.
 * @property {string} [body] A response body file name.
 * @property {string} [rawBody] A response body text. Ignore if "body" is set.
 */

/**
 * Create a mock API for parse request.
 *
 * @function
 * @param {MockApiDef} mock - A API definition data.
 * @param {module:mock-manager/MockManager} mockManager - Mock management instance.
 * @returns {Promise} A promise for send response.
 */
function create(mock, mockManager = MockManager) {
  return async (req, res) => {
    try {
      const parsers = await mockManager.getParsers(mock.id);
      const filePath = path.join(mock.directoryPath, parsers.current);
      const result = await parseRequest(req, filePath);
      await sendResponse(mock.directoryPath, res, result);
    } catch (e) {
      Logger.error(e);
      res.status(500).send();
    }
  };
}

/**
 * Parse HTTP request.
 *
 * @param {Request} req - Express.js request.
 * @param {string} parserFilePath - A parser file path.
 * @returns {Promise.<module:mock-creator.ParseResult>} A Promise for parse the request.
 * @throws Will throw an error if specified parser file was unsupported format.
 */
function parseRequest(req, parserFilePath) {
  const lowerParserFilePath = parserFilePath.toLowerCase();
  if (lowerParserFilePath.endsWith('.js')) {
    return parseRequestByJs(req, parserFilePath);
  } else if (lowerParserFilePath.endsWith('.yml')) {
    return parseRequestByYaml(req, parserFilePath);
  }
  throw new Error(`Parser file is unsupported format [parserFilePath=${parserFilePath}].`);
}

/**
 * Parse HTTP request by javascript parser.
 *
 * @param {Request} req - Express.js request.
 * @param {string} parserFilePath - A parser file path.
 * @returns {Promise.<module:mock-creator.ParseResult>} A Promise for parse the request.
 */
function parseRequestByJs(req, parserFilePath) {
  return new Promise((resolve) => {
    // eslint-disable-next-line global-require, import/no-dynamic-require
    resolve(require(parserFilePath).default(req));
  });
}

/**
 * Parse HTTP request by yaml parser.
 *
 * @param {Request} req - Express.js request.
 * @param {string} parserFilePath - A parser file path.
 * @returns {Promise.<module:mock-creator.ParseResult>} A Promise for parse the request.
 */
function parseRequestByYaml(req, parserFilePath) {
  return new Promise((resolve, reject) => {
    fsp.readFile(parserFilePath).then((value) => {
      const parser = yaml.safeLoad(value);
      if (parser instanceof Array) {
        // eslint-disable-next-line no-restricted-syntax
        for (const condition of parser) {
          const result = parseRequestByCondition(req, condition);
          if (result) {
            resolve(result);
          }
        }
      } else {
        resolve(parseRequestByResponseDetail(parser));
      }
      reject(new Error('Not match parser pattern.'));
    }).catch(reject);
  });
}

/**
 * Parse HTTP request by a parser condition.
 *
 * @param {Request} req - Express.js request object.
 * @param {module:mock-creator.ParserCondition} condition - Parser condition.
 * @returns {module:mock-creator.ParseResult} A parse result. If not match by condition then null.
 */
function parseRequestByCondition(req, condition) {
  if (isMatchRequestAndConditions(req, condition.if || {})) {
    return parseRequestByResponseDetail(condition.then || {});
  }
  return null;
}

/**
 * Check if match HTTP request and parser conditions.
 *
 * @param {Request} req - Express.js request object.
 * @param {module:mock-creator.ParserConditionIf} conditionIf - Parser matching conditions.
 * @returns {boolean} Return true if a match.
 */
function isMatchRequestAndConditions(req, conditionIf) {
  // A "params" value comparision by abstract, because Express.js path
  // parameters is string but parser "params" could set a numeric.
  return _.isMatchWith(
      req.params,
      conditionIf.params || {},
      (objValue, srcValue) => objValue === srcValue)
      && _.isMatch(req.query, conditionIf.query || {})
      && _.isMatch(req.body, conditionIf.body || {});
}

function parseRequestByResponseDetail(then) {
  return _.pickBy({
    status: then.status,
    headers: then.headers,
    body: then.body,
    rawBody: then.rawBody,
  }, value => !_.isUndefined(value));
}

/**
 * Send HTTP response by parser result.
 *
 * @param {string} directoryPath - A API data directory path.
 * @param {Response} res - A Express.js response object.
 * @param {module:mock-creator.ParseResult} parserResult - A parser result to send.
 * @returns {Promise} A promise for send response.
 */
function sendResponse(directoryPath, res, parserResult) {
  return new Promise((resolve, reject) => {
    if (_.has(parserResult, 'body')) {
      fsp.readFile(path.join(directoryPath, parserResult.body)).then(
        (value) => {
          sendResponseWithBody(res, parserResult, value);
          resolve();
        }
      ).catch(reject);
    } else {
      sendResponseWithBody(res, parserResult, parserResult.rawBody || '');
      resolve();
    }
  });
}

/**
 * Send HTTP response with body text.
 *
 * @param {Response} res - A Express.js response object.
 * @param {module:mock-creator.ParseResult} parserResult - A parser result to send.
 * @param {string} body - A response body text to send.
 */
function sendResponseWithBody(res, parserResult, body) {
  res.status(parserResult.status || 200)
    .set(parserResult.headers || {})
    .send(body);
}

export default {
  /**
   * @function
   * @see {@link module:mock-creator.create}
   */
  create,
};
