const path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var HtmlWebpackIncludeAssetsPlugin = require('html-webpack-include-assets-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');

module.exports = {
  entry: {
      main: './src/react-app.jsx',
      test: './src/app.js',
      vendor: [
          "path"
      ]
  },
  output: {
    filename: '[name].[chunkhash].js',
    chunkFilename: '[name].[chunkhash].bundle.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/'
  },
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
            test: /\.jsx$/,
            exclude: /(node_modules)/,
            use: {
                loader: 'babel-loader'
            }
        }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(['dist']),
  	new HtmlWebpackPlugin({
        title: 'React app',
        inject: true,
        template: 'public/index.html',
        hash: true,
        //css: ['./my.css'],
        chunks: ['main', 'mychunk', 'mychunk2', 'vendor'],
        filename: 'index.html'
    }),
    //new HtmlWebpackIncludeAssetsPlugin({ assets: ['./my.css'], append: true }),
    new HtmlWebpackPlugin({
        title: 'Test app',
        inject: true,
        template: 'public/index.html',
        chunks: ['test', 'mychunk', 'mychunk2', 'vendor'],
        filename: 'test.html'
    }),
    new webpack.HashedModuleIdsPlugin(),
    new webpack.optimize.CommonsChunkPlugin({
        name: 'vendor'
    }),
    new webpack.optimize.CommonsChunkPlugin({
        name: 'mychunk'
    })
  ]
};