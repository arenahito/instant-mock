/** @module */

import MockManager from '../mock/mock-manager';
import Logger from '../logger';

async function list(req, res) {
  try {
    const mocks = await MockManager.getMocksWithParsers();
    res.status(200).send(mocks);
  } catch (e) {
    res.status(500).send();
  }
}

async function update(req, res) {
  try {
    await MockManager.updateCurrentParser(
      req.params.id,
      req.body.parser
    );
    res.status(204).send();
  } catch (e) {
    Logger.error('Could not updated mock setting.', e);
    res.status(500).send();
  }
}

export default { list, update };
