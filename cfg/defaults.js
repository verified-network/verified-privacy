/**
 * Function that returns default values.
 * Used because Object.assign does a shallow instead of a deep copy.
 * Using [].push will add to the base array, so a require will alter
 * the base array output.
 */
'use strict';

const path = require('path');
const srcPath = path.join(__dirname, '/../src');
const dfltPort = 8000;

/**
 * Get the default modules object for webpack
 * @return {Object}
 */
function getDefaultModules() {
  return {
    rules: [
      {
        test: /\.(js|jsx)$/,
        enforce: "pre",
        include: srcPath,
        use: 'eslint-loader'
      },
      {
        test: /\.css$/,
        use: ['style-loader',
              'css-loader']
      },
      {
        test: /\.sass/,
        use: ['style-loader',
                  'css-loader',
                  'sass-loader?outputStyle=expanded&indentedSyntax']
      },
      {
        test: /\.scss/,
        use: ['style-loader',
                  'css-loader',
                  'sass-loader?outputStyle=expanded']
      },
      {
        test: /\.less/,
        use: ['style-loader',
                  'css-loader',
                  'less-loader']
      },
      {
        test: /\.styl/,
        use: ['style-loader',
                  'css-loader',
                  'stylus-loader']
      },
      /*{
        test: /\.(svg)$/,
        use: [
          {
            loader: 'svg-url-loader',
            options: {
              limit: 10000,
              esModule: false
            },
          },
        ],        
      },*/
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: [
              'file-loader',
              ],
      },
      {
        test: /\.(mp4|ogg)$/,
        use: 'file-loader'
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        use: 'file-loader'
      }
    ]
  };
}

module.exports = {
  srcPath: srcPath,
  publicPath: '/assets/',
  port: dfltPort,
  getDefaultModules: getDefaultModules
};
