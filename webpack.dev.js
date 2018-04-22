const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const webpack = require('webpack');
const ManifestPlugin = require('webpack-manifest-plugin');

module.exports = merge(common, {
  mode: 'development',
  output: {
    filename: '[name].[hash].js',
    chunkFilename: '[name].[chunkhash].bundle.js',
  },
  devtool: 'source-map',
  devServer: {
    contentBase: './dist',
    hot: true,
  },
  plugins: [
    new ManifestPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.DefinePlugin({
      BACKEND_IP: '"localhost"',
      BACKEND_PORT: 7777,
      BACKEND_PATH: '"__api__"',
    }),
  ],
});
