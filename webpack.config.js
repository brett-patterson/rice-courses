var path = require('path');
var BundleTracker = require('webpack-bundle-tracker');
var CleanWebpackPlugin = require('clean-webpack-plugin');


var OUT_DIR = path.resolve('./static/bundles/');


module.exports = {
    context: path.resolve('./static/'),

    entry: {
        courses: './js/courses/index',
        me: './js/me/index',
        tutorial: './js/tutorial',

        base: './base'
    },

    output: {
        path: OUT_DIR,
        filename: '[name]-[hash].js'
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
            test: /\.css$/,
            loader: 'style-loader!css-loader'
        }, {
            test: /\.(woff2?|ttf|eot|svg)$/,
            loader: 'url'
        }, {
            test: /bootstrap-sass\/assets\/javascripts\//,
            loader: 'imports?jQuery=jquery'
        }]
    },

    plugins: [
        new BundleTracker({filename: './webpack-stats.json'}),
        new CleanWebpackPlugin([OUT_DIR])
    ],

    resolve: {
        modulesDirectories: [
            'node_modules',
            path.resolve('./static/js/'),
            path.resolve('./static/css/')
        ],
        extensions: ['', '.js', '.jsx', '.css']
    }
};
