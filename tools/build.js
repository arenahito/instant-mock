/* eslint-disable no-console */

const fsp = require('fs-promise');
const cp = require('child_process');
const webpack = require('webpack');
const webpackConfig = require('../webpack.config');

function buildClient() {
  return new Promise((resolve, reject) => {
    webpack(webpackConfig).run((err, stats) => {
      if (err) {
        reject(err);
      }

      console.log(stats.toString({
        colors: true,
        reasons: true,
        hash: true,
        version: true,
        timings: true,
        chunks: false,
        chunkModules: false,
        cached: false,
        cachedAssets: false,
      }));

      resolve();
    });
  });
}

function buildServer() {
  return new Promise((resolve, reject) => {
    // cp.execFile('babel', ['src/server', '-d', 'dist/server'], (err, stdout, stderr) => {
    cp.exec('babel src/server -d dist/server', (err, stdout, stderr) => {
      if (stdout) {
        console.info(stdout);
      }
      if (stderr) {
        console.error(stderr);
      }

      if (err) {
        reject(err);
      }
      resolve();
    });
  });
}

if (!fsp.existsSync('dist')) {
  fsp.mkdirSync('dist');
}
fsp.copySync('src/public', 'dist/public');

Promise.all([
  buildClient(),
  buildServer(),
]).catch((err) => {
  console.error('Could not build.', err);
});
