/** @module */

import ServerSettingsManager from '../setting/server-settings-manager';

function list(req, res) {
  res.status(200).send(ServerSettingsManager.getSettings());
}

export default { list };
