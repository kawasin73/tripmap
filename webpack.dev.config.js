'use strict';

var path = require('path');
var webpack = require('webpack');
var config = require('./webpack.base.config.js');
var update = require('react-addons-update');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var HtmlWebpackHarddiskPlugin = require('html-webpack-harddisk-plugin');

config = update(config, {
  mode: { $set: 'development' },

  entry: { $set: ['babel-polyfill', './frontend/entry/index.js'] },

  devtool: { $set: 'eval-source-map' },

  output: {
    $set: {
      path: path.resolve(__dirname, 'dev/static/scripts'),
      pathinfo: true,
      publicPath: 'http://localhost:3456/static/scripts/',
      filename: 'main.js'
    }
  },

  plugins: {
    $push: [
      new webpack.HotModuleReplacementPlugin(),
      new HtmlWebpackPlugin({
        alwaysWriteToDisk: true,
        inject: true,
        filename: '../../../templates/index.html',
        template: 'frontend/views/index.html'
      }),
      new HtmlWebpackPlugin({
        alwaysWriteToDisk: true,
        inject: true,
        filename: '../../index.html',
        template: 'frontend/views/index.html'
      }),
      new HtmlWebpackHarddiskPlugin()
    ]
  },

  devServer: {
    $set: {
      publicPath: '/static/scripts',
      host: "0.0.0.0",
      port: 3456,
      contentBase: path.join(__dirname, "./dev"),
      inline: true,
      hot: true,
      stats: {
        colors: true
      },
      historyApiFallback: true,
      headers: {
        'Access-Control-Allow-Origin': 'http://localhost:5000',
        'Access-Control-Allow-Headers': 'X-Requested-With'
      },

      proxy: {
        '/*': 'http://localhost:5000'
      }
    }
  }
});

module.exports = config;
