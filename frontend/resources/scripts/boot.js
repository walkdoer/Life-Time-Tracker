/**
 * 启动引导
 */
require.config({
    baseUrl: './resources/',
    paths: {
        'requireLib': 'vendors/requirejs/require',
        'jquery': 'vendors/jquery/dist/jquery',
        'bootstrap': 'vendors/bootstrap/dist/js/bootstrap',
        'underscore': 'vendors/underscore/underscore',
        'text': 'vendors/requirejs-text/text',
        'moment': 'vendors/moment/moment',
        'highcharts': 'vendors/highcharts/highcharts.src',
        'd3': 'vendors/d3/d3',
        'q': 'vendors/q/q'
    },
    shim: {
        'bootstrap': {
            deps: ['jquery']
        },
        'highcharts': {
            exports: 'Highcharts',
            deps: ['jquery']
        }
    },
    include: ['requireLib', 'text', 'd3']
});

require(['./scripts/app', 'd3'], function (app) {
    'use strict';
    app.initialize();
});

