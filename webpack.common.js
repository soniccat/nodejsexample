let path = require('path');
let HtmlWebpackPlugin = require('html-webpack-plugin');
let CleanWebpackPlugin = require('clean-webpack-plugin');
let webpack = require('webpack');

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
            test: /\.jsx?$/,
            exclude: /(node_modules)/,
            use: {
                loader: 'babel-loader'
            }
        }
    ]
  },
  resolve: {
      extensions: ['.js', '.jsx', '.scss'],
      alias: {
          Components: path.resolve(__dirname, 'src/components/'),
          Elements: path.resolve(__dirname, 'src/elements/'),
          Utils: path.resolve(__dirname, 'src/utils/'),
          CSS: path.resolve(__dirname, 'css/'),
      }
  },
  plugins: [
    new CleanWebpackPlugin(['dist']),
  	new HtmlWebpackPlugin({
        title: 'React app',
        inject: true,
        template: 'public/index.html',
        hash: true,
        chunks: ['main', 'mychunk', 'mychunk2', 'vendor'],
        filename: 'index.html'
    }),
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