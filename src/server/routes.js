/** @module */

import ApiLogs from './api/logs';
import ApiMock from './api/mocks';
import Server from './api/server';

export default function registerRoutes(app) {
  app.get('/api/server', Server.list);
  app.get('/api/logs', ApiLogs.list);
  app.get('/api/mocks', ApiMock.list);
  app.patch('/api/mocks/:id', ApiMock.update);
}
