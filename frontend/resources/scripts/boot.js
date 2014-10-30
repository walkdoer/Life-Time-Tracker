/**
 * 启动引导
 */
require.config({
    baseUrl: '/resources/',
    paths: {
        'app': 'scripts/',
        'requireLib': 'vendors/requirejs/require',
        'react': 'vendors/react_min/react',
        'jsx': 'scripts/libs/jsx',
        'JSXTransformer': 'scripts/libs/JSXTransformer-0.11.2',
        'jquery': 'vendors/jquery/dist/jquery',
        'bootstrap': 'vendors/bootstrap/dist/js/bootstrap',
        'underscore': 'vendors/underscore/underscore',
        'text': 'vendors/requirejs-text/text',
        'moment': 'vendors/moment/moment',
        'highcharts': 'vendors/highcharts/highcharts.src',
        'd3': 'vendors/d3/d3',
        'Backbone': 'vendors/backbone/backbone',
        'q': 'scripts/libs/q'
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

require(['scripts/app', 'd3', 'bootstrap'], function (app) {
    'use strict';
    app.initialize();
});

