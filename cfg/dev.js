'use strict';

let path = require('path');
let webpack = require('webpack');
let baseConfig = require('./base');
let defaultSettings = require('./defaults');

// Add needed plugins here
const WorkerPlugin = require('worker-plugin');

let config = Object.assign({}, baseConfig, {
  entry: [
    'webpack-dev-server/client?http://127.0.0.1:' + defaultSettings.port,
    'webpack/hot/dev-server',
    './src/index'
  ],
  cache: true,
  devtool: 'eval-source-map',
  plugins: [
    //added LoaderOptionsPlugin for debug
    new WorkerPlugin(),
    new webpack.LoaderOptionsPlugin({
      debug: true
    }),
    new webpack.HotModuleReplacementPlugin(),
    new WorkerPlugin()
  ],
  module: defaultSettings.getDefaultModules(),
  mode: 'development',
});

// Add needed loaders to the defaults here
config.module.rules.push({
  test: /\.(js|jsx)$/,
  loader: 'babel-loader',
  options:{
    cacheDirectory:true,
    cacheCompression:true,
    plugins:["@babel/plugin-proposal-async-generator-functions",
              "@babel/plugin-proposal-object-rest-spread"]
  }
});

module.exports = config;
