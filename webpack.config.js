/**
 * JS for WEB
 * Copyright 2016 Baidu Inc. All rights reserved.
 *
 * @file 打包脚本
 * @author zhangzengwei
 * @date 2016-05-26
 */
const webpack = require('webpack');
const merge = require('webpack-merge');
const HtmlwebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const AssetsPlugin = require('assets-webpack-plugin');
const TransferWebpackPlugin = require('transfer-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const WebpackCleanPlugin = require('webpack-clean-plugin');

const path = require('path');
const PATHS = {
    app: path.join(__dirname, 'app'),
    build: path.join(__dirname, 'build')
};

const TARGET = process.env.npm_lifecycle_event;
const DEBUG = TARGET !== 'prod';
const IS_DEV = TARGET === 'dev';

var common = {
    entry: {
        app: [path.join(PATHS.app, '/app.js')],
        index: [path.join(PATHS.app, '/features/index/index.controller')],
        // wall: [path.join(PATHS.app, '/features/wall/wall.controller')],
        // mobile: [path.join(PATHS.app, '/features/mobile/mobile.controller')],
        // pc: [path.join(PATHS.app, '/features/pc/pc.controller')],
        platform: [path.join(PATHS.app, '/features/platform/platform.controller')]
        // device: [
        //     path.join(PATHS.app, '/features/device/device.controller'),
        //     path.join(PATHS.app, '/features/device/deviceDetail.controller')
        // ],
        // protocol: [path.join(PATHS.app, '/features/protocol/protocol.controller')]
    },
    output: {
        path: PATHS.build,
        // publicPath: PATHS.build,
        filename: DEBUG ? '[name].js' : '[name].[hash].min.js',
        chunkFilename: DEBUG ? '[name].js' : '[name].[hash].min.js'
    },
    module: {
        loaders: [
            // LESS
            {
                test: /\.less$/,
                loader: 'style!css!less'
            },
            {
                // Test expects a RegExp! Note the slashes!
                test: /\.css$/,
                loaders: ['style', 'css']
                // Include accepts either a path or an array of paths.
                // include: PATHS.app
            },
            {
                test: /\.(png|woff|woff2|otf|eot|ttf|svg|jpg)(\?v=\d+\.\d+\.\d+)?$/,
                loader: 'url-loader?limit=100000'
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loaders: ['ng-annotate', 'babel-loader']
            },
            {
                // HTML LOADER
                // Reference: https://github.com/webpack/raw-loader
                // Allow loading html through js
                test: /\.html$/,
                loader: 'raw-loader'
            }
        ]
    },
    plugins: [
        new HtmlwebpackPlugin({
            // required
            inject: false,
            // template: require('html-webpack-template'),
            template: path.join(PATHS.app, '/index.ejs'),
            // optional
            // appMountId: 'app',
            // baseHref: 'http://localhost:8080',
            // devServer: 3080,
            googleAnalytics: {
                trackingId: 'UA-XXXX-XX',
                pageViewOnLoad: true
            },
            filename: path.join(PATHS.build, '/index.html'),
            mobile: true,
            title: 'Angular1.x with ES6',
            // window: {
            //     env: {
            //         apiHost: 'http://127.0.0.1:3012'
            //     }
            // },
            chunks: ['common', 'app']
        }),
        // new webpack.optimize.CommonsChunkPlugin('vendors', DEBUG ? 'vendors.js' : 'vendors.[hash].js'),
        // new webpack.optimize.CommonsChunkPlugin('jquery', DEBUG ? 'jquery.js' : 'jquery.[hash].js'),
        new webpack.optimize.CommonsChunkPlugin({
            name: 'common',
            // chunks: ['app', 'index', 'wall', 'mobile', 'pc', 'platform'],
            chunks: ['app', 'index', 'platform'],
            minChunks: 2
        }),
        // new webpack.optimize.CommonsChunkPlugin({
        //   names: [ 'jquery', 'vendors']
        // }),
        // new webpack.optimize.UglifyJsPlugin({
        //            sourceMap: true,
        //            mangle: false
        // }),
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery',
            'window.jQuery': 'jquery'
        }),
        // new ExtractTextPlugin("[name].css"),
        new AssetsPlugin({
            prettyPrint: true
        }),
        new CopyWebpackPlugin([
            {from: path.join(PATHS.app, '/favicon.png'), to: path.join(PATHS.build, '/favicon.png')}
        ]),
        new TransferWebpackPlugin([
            // {from: path.join(PATHS.app, '/style'), to: '/style'},
            {from: path.join(PATHS.app, '/img'), to: '/img'}
        ], path.resolve(path.join(PATHS.build)))
    ]
};

const devServerPort = 8091;
if (IS_DEV) {
    require('./mockserver/server');
    common.entry.app.unshift('webpack-dev-server/client?http://localhost:' + devServerPort + '/', 'webpack/hot/dev-server');
    common = merge(common, {
        devServer: {
            contentBase: PATHS.build,
            historyApiFallback: true,
            disableHostCheck: true,
            hot: true,
            inline: false,
            progress: true,
            // Display only errors to reduce the amount of output.
            stats: 'errors-only',

            // Parse host and port from env so this is easy to customize.
            host: process.env.HOST,
            port: devServerPort,
            outputPath: PATHS.build
            // devServerPort
            // process.env.PORT
        },
        devtools: 'eval-source-map',
        devtool: 'inline-source-map',
        plugins: [
            new webpack.HotModuleReplacementPlugin()
        ]
    });
}

if (!DEBUG) {
    console.log('compress');
    // 压缩打包的文件
    common.plugins.push(new webpack.optimize.UglifyJsPlugin({
        compress: {
            // supresses warnings, usually from module minification
            warnings: false
        }
    }));
    common.plugins.unshift(
        new WebpackCleanPlugin({
            on: 'emit',
            path: [PATHS.build]
        })
    );
}

module.exports = common;
