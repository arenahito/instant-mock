/** @module client/components/Logs */

/* eslint-disable import/no-extraneous-dependencies */
import io from 'socket.io-client';
import 'isomorphic-fetch';

import Logger from '../logger';

/**
 * A log data for display.
 *
 * @typedef {Object} module:client/components/Logs.DisplayMockLog
 * @property {MockLog} log - A log received from server.
 * @property {boolean} show - Set true when showing.
 * @property {boolean} success - Set true when mock send success response (lower than 400).
 * @property {boolean} warning - Set true when mock send warning response (between 400 to 500).
 * @property {boolean} error - Set true when mock send error response (higher and equal than 500).
 */

/**
 * Generate log data for display.
 *
 * @param {boolean} show - Set true when showing.
 * @param {MockLog} log - A log received from server.
 * @returns {module:client/components/Logs.DisplayMockLog} A log data for display.
 */
function generateLog(show, log) {
  return {
    log,
    show,
    success: log.res.statusCode < 400,
    warning: log.res.statusCode >= 400 && log.res.statusCode < 500,
    error: log.res.statusCode >= 500,
  };
}

/**
 * The component for displaying mock access logs.
 */
export default {
  data() {
    return {
      enableAutoExpand: true,
      logs: [],
      error: null,
    };
  },

  methods: {
    /**
     * Toggle show/hide the log.
     *
     * @param {number} index - A log index.
     */
    toggleLog(index) {
      this.logs[index].show = !this.logs[index].show;
    },

    expandAll() {
      this.logs.forEach((_, index) => {
        this.logs[index].show = true;
      });
    },

    collapseAll() {
      this.logs.forEach((_, index) => {
        this.logs[index].show = false;
      });
    },
  },

  async created() {
    let serverInfo;
    try {
      const response = await fetch('/api/server');
      serverInfo = await response.json();
    } catch (e) {
      this.error = 'Error: Could not get server information.';
      Logger.error('Could not get server information.', e);
      return;
    }

    const { host, port } = serverInfo.socket;
    const socket = io.connect(`http://${host}:${port}`);

    socket.on('initialLogs', (data) => {
      this.logs = data.map(generateLog.bind(null, this.enableAutoExpand))
        .concat(this.logs);
    });
    socket.on('addLog', (data) => {
      this.logs.unshift(generateLog(this.enableAutoExpand, data));
    });
  },
};
