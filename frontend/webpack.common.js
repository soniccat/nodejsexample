const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const webpack = require('webpack');

module.exports = {
  entry: {
    main: './src/react-app.tsx',
    test: './src/app.js',
    vendor: [
      'path',
    ],
  },
  output: {
    filename: '[name].[hash].js',
    chunkFilename: '[name].[chunkhash].bundle.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/',
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          { loader: 'style-loader' },
          { loader: 'css-loader' },
        ],
      }, {
        test: /\.scss$/,
        use: [
          { loader: 'style-loader' },
          { loader: 'css-loader' },
          { loader: 'sass-loader' },
        ],
      }, {
        test: /\.jpg$/,
        use: [
          { loader: 'file-loader' },
        ],
      }, { 
        test: /\.tsx?$/, 
        loader: "ts-loader" 
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.ts', '.tsx', '.scss', '.d.tsx'],
    alias: {
      UI: path.resolve(__dirname, 'src/ui/'),
      Data: path.resolve(__dirname, 'src/data/'),
      Model: path.resolve(__dirname, '../model/'),
      Utils: path.resolve(__dirname, 'src/utils/'),
      CSS: path.resolve(__dirname, 'css/'),
      Node: path.resolve(__dirname, 'node_modules/'),
    },
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
    },
  },
  // externals: {
  //   "react": "React",
  //   "react-dom": "ReactDOM"
  // },
  plugins: [
    new CleanWebpackPlugin(['dist']),
    new HtmlWebpackPlugin({
      title: 'React app',
      inject: true,
      template: 'public/index.html',
      hash: true,
      excludeChunks: ['test'],
      filename: 'index.html',
    }),
    new HtmlWebpackPlugin({
      title: 'Test app',
      inject: true,
      template: 'public/index.html',
      excludeChunks: ['main'],
      filename: 'test.html',
    }),
    new webpack.HashedModuleIdsPlugin(),
  ],
};
