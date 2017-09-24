var HtmlWebpackPlugin = require('html-webpack-plugin');
var UglifyJSPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
  entry: './app.js',
  output: {
    filename: 'bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          { loader: "css-loader" }
        ],
      }
    ]
  },
  plugins: [
  	new UglifyJSPlugin(),
  	new HtmlWebpackPlugin()
  ]
}