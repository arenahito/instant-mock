import express from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import path from 'path';
import SocketIO from 'socket.io';
import babelRegister from 'babel-register';

import MockLogManager from './mock/mock-log-manager';
import MockManager from './mock/mock-manager';
import Logger from './logger';
import ServerSettingsManager from './setting/server-settings-manager';
import UserSettingsManager from './setting/user-settings-manager';
import registerRoutes from './routes';
import setupForDevelopment from './development';

babelRegister({ only: './mock/**' });

ServerSettingsManager.loadSync();
const serverSettings = ServerSettingsManager.getSettings();

UserSettingsManager.loadSync();

const app = express();

app.use('/mock/*', MockLogManager.parser());
app.use(morgan(':method :url :status :response-time ms', { immediate: false }));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.text());

setupForDevelopment(app);

app.use(express.static(path.join(__dirname, '../public')));

registerRoutes(app);
MockManager.loadSync(app);

app.use((req, res) => {
  Logger.info(req.url);
  Logger.dir(req.body);
  res.status(404).send();
});

const io = new SocketIO(
  serverSettings.socket.port,
  { host: serverSettings.socket.host }
);
io.on('connection', (socket) => {
  socket.emit('initialLogs', MockLogManager.getLogs());

  MockLogManager.on('add', (log) => {
    socket.emit('addLog', log);
  });
});

app.listen(serverSettings.http.port, serverSettings.http.host);
