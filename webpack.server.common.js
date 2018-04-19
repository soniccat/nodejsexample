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
      main: './servers/backend/backendserver.js'
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'serverDist'),
    publicPath: '/'
  },
  target: 'node',
  externals: nodeModules,
  resolve: {
      extensions: ['.js']
  },
  plugins: [
    new CleanWebpackPlugin(['serverDist'])
  ]
};