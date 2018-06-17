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
    extensions: ['.js', '.ts', '.tsx', '.scss'],
    alias: {
      Components: path.resolve(__dirname, 'src/components/'),
      Elements: path.resolve(__dirname, 'src/elements/'),
      Model: path.resolve(__dirname, 'src/model/'),
      Utils: path.resolve(__dirname, 'src/utils/'),
      CSS: path.resolve(__dirname, 'css/'),
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
