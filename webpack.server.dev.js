const merge = require('webpack-merge');
const common = require('./webpack.server.common.js');
const webpack = require('webpack');

module.exports = merge(common, {
    devtool: 'source-map',
    plugins: [
        new webpack.BannerPlugin({
            banner: 'require("source-map-support").install();',
            raw: true,
            entryOnly: false })
    ],
});