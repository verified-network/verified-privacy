'use strict';

let path = require('path');
let webpack = require('webpack');

let baseConfig = require('./base');
let defaultSettings = require('./defaults');

// Add needed plugins here
const TerserPlugin = require('terser-webpack-plugin');
const WorkerPlugin = require('worker-plugin');

let config = Object.assign({}, baseConfig, {
  entry: path.join(__dirname, '../src/index'),
  cache: false,
  devtool: 'eval-source-map',
  plugins: [
    //added loaderOptionsPlugin for debug
    new webpack.LoaderOptionsPlugin({
      debug: true
    }),
    new webpack.optimize.AggressiveMergingPlugin(),
    new WorkerPlugin()
  ],
  module: defaultSettings.getDefaultModules()
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

module.exports = {
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin()],
  },
};
module.exports = config;
