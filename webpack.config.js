const webpack = require('webpack');
const BabiliPlugin = require('babili-webpack-plugin');

module.exports = {
  entry: {
    app: './src/client/app.js',
    vendor: [
      'babel-polyfill',
      'lodash',
      'vue',
      'whatwg-fetch',
      'socket.io-client',
    ],
  },
  output: {
    path: './dist/public/scripts',
    filename: '[name].bundle.js',
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        query: {
          presets: ['env'],
          plugins: ['transform-vue-jsx'],
        },
      }, {
        test: /\.vue$/,
        loader: 'vue-loader',
      }, {
        test: /\.styl$/,
        loader: 'style-loader!css-loader!stylus-loader',
      },
    ],
  },
  plugins: [
    new BabiliPlugin(),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      filename: 'vendor.bundle.js',
    }),

  ],
  resolve: {
    alias: {
      vue$: 'vue/dist/vue.esm.js',
    },
  },
};
