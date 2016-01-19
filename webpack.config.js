var path = require('path');
var BundleTracker = require('webpack-bundle-tracker');
var CleanWebpackPlugin = require('clean-webpack-plugin');


var OUT_DIR = path.resolve('./static/bundles/');


module.exports = {
    context: __dirname,

    entry: {
        courses: './static/js/courses/index',
        me: './static/js/me/index',
        tutorial: './static/js/tutorial',

        base: './static/base'
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
        modulesDirectories: ['node_modules'],
        extensions: ['', '.js', '.jsx']
    }
};
