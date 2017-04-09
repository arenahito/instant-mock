/** @module */

import _ from 'lodash';
import onFinished from 'on-finished';
import EventEmitter from 'events';

/**
 * Mock access log manager.
 *
 * @property {number} _maxLogs - Maximum number for stored logs.
 * @property {MockLog[]} _logs - Mock access logs.
 */
class MockLogManager extends EventEmitter {

  /**
   * Create the mock log manager.
   *
   * @param {number} [maxLogs=50] - Maximum log size.
   */
  constructor(maxLogs = 50) {
    super();
    this._maxLogs = maxLogs;
    this._logs = [];
  }

  /**
   * Generate the middleware for mock logging.
   *
   * @returns {Function} The middleware for mock logging.
   */
  parser() {
    return (req, res, next) => {
      this._setRequestCapture(req, next);
      this._overrideResponseSender(res);
      onFinished(res, this._onFinishedResponse.bind(this));
      next();
    };
  }

  /**
   * Get the all stored mock logs.
   *
   * @returns {MockLog[]} The mock logs.
   */
  getLogs() {
    return _.cloneDeep(this._logs);
  }

  /**
   * Set request capture to request object.
   *
   * The request cature set raw-body to request object (req.rawBody).
   *
   * @param {Request} req - A Express.js request object.
   */
  _setRequestCapture(req) {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
    });
    req.on('end', () => {
      /* eslint-disable no-param-reassign */
      req.datetime = new Date();
      req.rawBody = data;
      /* eslint-enable no-param-reassign */
    });
  }

  /**
   * Override response sender for capturing response body.
   *
   * The response sender set response body to response object (res.body).
   *
   * @param {Response} res - Express.js response object.
   */
  _overrideResponseSender(res) {
    /* eslint-disable no-param-reassign */
    res.originalSend = res.send;
    res.send = (body) => {
      res.datetime = new Date();
      if (body) {
        res.body = body.toString();
      } else {
        res.body = '';
      }
      res.originalSend(body);
    };
    /* eslint-enable no-param-reassign */
  }

  /**
   * Handle response on finished event.
   *
   * @param {Error} err - Error object.
   * @param {Response} res - A Express.js response object.
   */
  _onFinishedResponse(err, res) {
    if (err) {
      return;
    }

    const log = {
      req: {
        url: res.req.url,
        method: res.req.method,
        headers: _.cloneDeep(res.req.headers),
        body: res.req.rawBody,
        datetime: res.req.datetime,
      },
      res: {
        statusCode: res.statusCode,
        headers: _.cloneDeep(res.getHeaders()),
        body: res.body,
        datetime: res.datetime,
      },
    };

    this._logs.unshift(log);
    this.emit('add', log);

    while (this._logs.length > this._maxLogs) {
      this._logs.pop();
    }
  }
}

// Export singleton class for test.
export const TestMockLogManager = MockLogManager;

/** The only MockLogManager instance. */
export default new MockLogManager();
