'use strict';
let path = require('path');
let defaultSettings = require('./defaults');

// Additional npm or bower modules to include in builds
// Add all foreign plugins you may need into this array
// @example:
//let npmBase = path.join(__dirname, '../node_modules');
//let additionalPaths = [ path.join(npmBase, 'ipfs-http-client') ];
let additionalPaths = [];

module.exports = {
  watch: true,
  watchOptions: {
    aggregateTimeout: 300,
    poll: 1000,
    ignored: ['files/**/*.js', 'node_modules']
  },
  output: {
    path: path.join(__dirname, '/../dist/assets'),
    filename: 'app.js',
    publicPath: defaultSettings.publicPath
  },
  devServer: {
    contentBase: './src/',
    historyApiFallback: true,
    port: defaultSettings.port,
    publicPath: defaultSettings.publicPath,
    noInfo: false,
    hot: true
  },
  resolve: {
    extensions: ['*', '.js', '.jsx'],
    alias: {
      actions: `${defaultSettings.srcPath}/actions/`,
      components: `${defaultSettings.srcPath}/components/`,
      sources: `${defaultSettings.srcPath}/sources/`,
      stores: `${defaultSettings.srcPath}/stores/`,
      styles: `${defaultSettings.srcPath}/styles/`,
      assets: `${defaultSettings.srcPath}/assets/`,
      translations: `${defaultSettings.srcPath}/translations/`,
      config: `${defaultSettings.srcPath}/config/` + process.env.REACT_WEBPACK_ENV,
      'react/lib/ReactMount': 'react-dom/lib/ReactMount'
    }
  },
  module: {}
};
