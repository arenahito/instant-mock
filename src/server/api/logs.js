/** @module */

import MockLogManager from '../mock/mock-log-manager';

function list(req, res) {
  res.status(200).send(MockLogManager.getLogs());
}

export default { list };
