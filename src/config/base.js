'use strict';

// Settings configured here will be merged into the final config object.
export default {
  module: {
    target: 'node', // in order to ignore built-in modules like path, fs, etc.
    // eslint-disable-next-line no-undef
    externals: [nodeExternals({
      // this WILL include `jquery` and `webpack/hot/dev-server` in the bundle, as well as `lodash/*`
      allowlist: ['jquery', 'webpack/hot/dev-server'],
    })], // in order to ignore all modules in node_modules folder
    preLoaders: [
      {
        test: /\.js|\.jsx$/,
        loaders: ['eslint-loader'],
        exclude: ['node_modules', /\.json$/],
      },
    ],
    loaders: [
      {
        test: /\.json$/,
        loader: 'json-loader',
      },
      {
        test: /\.js|\.jsx$/,
        loaders: ['babel'],
        // eslint-disable-next-line no-undef
        include: path.join(__dirname, 'src'),
      },
    ],
  },
};
