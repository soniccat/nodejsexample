var HtmlWebpackPlugin = require('html-webpack-plugin');
var UglifyJSPlugin = require('uglifyjs-webpack-plugin');
var ManifestPlugin = require('webpack-manifest-plugin');
const path = require('path');

module.exports = {
  entry: './src/app.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
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
      }
    ]
  },
  plugins: [
  	//new UglifyJSPlugin(),
  	new HtmlWebpackPlugin({
        title: 'Output Management'
    }),
      new ManifestPlugin()
  ]
};