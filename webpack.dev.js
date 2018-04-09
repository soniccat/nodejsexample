const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const webpack = require('webpack');
var ManifestPlugin = require('webpack-manifest-plugin');

  module.exports = merge(common, {
      mode: 'development',
      output: {
          filename: '[name].[hash].js',
          chunkFilename: '[name].[chunkhash].bundle.js'
      },
      devtool: 'cheap-eval-source-map',
      devServer: {
          contentBase: './dist',
          hot: true
      },
      plugins: [
          new ManifestPlugin(),
          new webpack.HotModuleReplacementPlugin()
      ]
});