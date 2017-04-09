/* eslint-disable import/no-extraneous-dependencies, global-require */

import _ from 'lodash';

export default function setupForDevelopment(app) {
  if (app.get('env') !== 'development') {
    return;
  }

  const webpackMiddleware = require('webpack-dev-middleware');
  const webpack = require('webpack');
  const webpackConfig = require('../../webpack.config');

  app.use(webpackMiddleware(
    webpack(_.merge(
      webpackConfig,
      {
        output: { path: '/' },
      }
    )),
    {
      publicPath: '/scripts',
      stats: { colors: true },
    }
  ));
}
