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
  	new HtmlWebpackPlugin()
  ]
};