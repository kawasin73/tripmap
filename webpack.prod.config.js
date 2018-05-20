'use strict';

var path = require('path');
var update = require('react-addons-update');
var webpack = require('webpack');
var config = require('./webpack.base.config.js');
var HtmlWebpackPlugin = require('html-webpack-plugin');

var CleanWebpackPlugin = require('clean-webpack-plugin');

var SCRIPTS_PATH = path.resolve(__dirname, 'static/scripts');
var TEMPLATES_PATH = path.resolve(__dirname, 'templates');

config = update(config, {
  bail: { $set: true },

  entry: { $set: ['babel-polyfill', './frontend/entry/index.js'] },

  mode: { $set: 'production' },

  profile: { $set: false },

  devtool: { $set: '#source-map' },

  output: {
    $set: {
      path: SCRIPTS_PATH,
      publicPath: '/static/scripts/',
      filename: 'bundle.[hash].min.js'
    }
  },

  plugins: {
    $push: [
      new CleanWebpackPlugin([SCRIPTS_PATH, TEMPLATES_PATH]),
      new HtmlWebpackPlugin({
        inject: true,
        filename: '../../templates/index.html',
        template: 'frontend/views/index.html'
      })
    ]
  }
});

module.exports = config;
