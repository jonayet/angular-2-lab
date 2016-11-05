/**
 * Created by jonayet on 11/4/16.
 */
var webpackConfig = require('./webpack.test');

module.exports = function (config) {
    var _config = {
        basePath: '',

        frameworks: ['jasmine'],

        files: [
            {pattern: './config/karma-test-shim.js', watched: false}
        ],

        preprocessors: {
            './config/karma-test-shim.js': ['webpack', 'sourcemap']
        },

        webpack: webpackConfig,

        webpackMiddleware: {
            stats: 'errors-only'
        },

        webpackServer: {
            noInfo: true
        },

        reporters: ['mocha'],

        mochaReporter: {
            output: 'noFailures'
        },

        port: 9876,
        colors: true,
        logLevel: config.LOG_ERROR,
        autoWatch: true,
        browsers: ['PhantomJS'],
        singleRun: false
    };

    config.set(_config);
};