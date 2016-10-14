var path = require('path');

var Webpack = require('webpack');
var BundleTracker = require('webpack-bundle-tracker');
var CleanWebpackPlugin = require('clean-webpack-plugin');

var PRODUCTION = process.env.NODE_ENV === 'production';
var OUT_DIR = path.resolve('./static/bundles/');

var PLUGINS = [
    new BundleTracker({filename: './webpack-stats.json'}),
    new CleanWebpackPlugin([OUT_DIR]),
    new Webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
    })
];

if (PRODUCTION) {
    PLUGINS.push(new Webpack.optimize.UglifyJsPlugin({
        compress: {
            warnings: false
        }
    }));
}


module.exports = {
    context: path.resolve('./static/js/'),

    entry: {
        app: './index'
    },

    output: {
        path: OUT_DIR,
        filename: '[name]-[hash].js',
        publicPath: process.env.ASSETS_PUBLIC_URL
    },

    module: {
        loaders: [{
            test: /\.jsx?$/,
            exclude: /node_modules/,
            loader: 'babel',
            query: {
                presets: ['react', 'es2015', 'stage-0']
            }
        }, {
            test: /\.scss$/,
            loader: 'style-loader!css-loader!sass-loader'
        }, {
            test: /\.(woff2?|ttf|eot|svg)$/,
            loader: 'url'
        }, {
            test: /bootstrap-sass\/assets\/javascripts\//,
            loader: 'imports?jQuery=jquery'
        }]
    },

    plugins: PLUGINS,

    resolve: {
        modulesDirectories: [
            'node_modules',
            path.resolve('./static/js/'),
            path.resolve('./static/css/')
        ],
        extensions: ['', '.js', '.jsx', '.scss']
    }
};
