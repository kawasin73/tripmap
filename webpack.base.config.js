var path = require('path');
var webpack = require('webpack');

module.exports = {
  target: 'web',

  resolve: {
    modules: [path.resolve(__dirname, "frontend"), 'node_modules'],
    extensions: ['.js', '.jsx', '.scss']
  },

  plugins: [
    new webpack.DefinePlugin({
      NODE_ENV: process.env.NODE_ENV
    })
  ],

  module: {
    rules: [
      {
        enforce: "pre",
        test: /\.js$/,
        exclude: /node_modules/,
        loader: "eslint-loader"
      },
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: "babel-loader",
        options: {
          presets: [
            // env を指定することで、ES2017 を ES5 に変換。
            // {modules: false}にしないと import 文が Babel によって CommonJS に変換され、
            // webpack の Tree Shaking 機能が使えない
            ['env', {'modules': false}],
            // React の JSX を解釈
            'react'
          ]
        }
      }
    ]
  }

};
