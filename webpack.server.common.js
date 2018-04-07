let path = require('path');
let CleanWebpackPlugin = require('clean-webpack-plugin');
let webpack = require('webpack');
var fs = require('fs');

// some magic to make server config work
// https://jlongster.com/Backend-Apps-with-Webpack--Part-I
var nodeModules = {};
fs.readdirSync('node_modules')
    .filter(function(x) {
        return ['.bin'].indexOf(x) === -1;
    })
    .forEach(function(mod) {
        nodeModules[mod] = 'commonjs ' + mod;
    });

module.exports = {
  entry: {
      main: './servers/backendserver.js'
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'serverDist'),
    publicPath: '/'
  },
  target: 'node',
  externals: nodeModules,
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          {loader: "style-loader"},
          {loader: "css-loader" }
        ]
      }, {
        test: /\.scss$/,
        use: [
            {loader: "style-loader"},
            {loader: "css-loader"},
            {loader: "sass-loader"}
        ]
      }, {
            test: /\.png$/,
            use: [
                {loader: "file-loader"}
            ]
      }, {
            test: /\.jsx?$/,
            exclude: /(node_modules)/,
            use: {
                loader: 'babel-loader'
            }
        }
    ]
  },
  resolve: {
      extensions: ['.js', '.jsx', '.scss']
  },
  plugins: [
    new CleanWebpackPlugin(['serverDist'])
  ]
};