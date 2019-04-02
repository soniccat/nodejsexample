const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const webpack = require('webpack');
const fs = require('fs');

// some magic to make server config work
// https://jlongster.com/Backend-Apps-with-Webpack--Part-I
const nodeModules = {};
fs.readdirSync('node_modules')
  .filter(x => ['.bin'].indexOf(x) === -1)
  .forEach((mod) => {
    nodeModules[mod] = `commonjs ${mod}`;
  });

module.exports = {
  entry: {
    main: './src/backendserver.ts',
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/',
  },
  target: 'node',
  externals: nodeModules,
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.tsx', '.ts'],
    alias: {
      Model: path.resolve(__dirname, '../model/'),
      DB: path.resolve(__dirname, 'src/db'),
      Logger: path.resolve(__dirname, 'src/logger'),
      Proxy: path.resolve(__dirname, 'src/proxy'),
      Data: path.resolve(__dirname, 'src/data'),
      Utils: path.resolve(__dirname, 'src/utils'),
      main: path.resolve(__dirname, 'src'),
    },
  },
  plugins: [
    new CleanWebpackPlugin(),
  ],
};
