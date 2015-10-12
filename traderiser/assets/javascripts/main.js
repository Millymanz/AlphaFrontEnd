// Require.js allows us to configure shortcut alias
// Their usage will become more apparent futher along in the tutorial.

if (typeof DEBUG === 'undefined')
    DEBUG = true;

require.config({
    paths: {
        // Major libraries
        underscore: 'vendor/underscore/underscore', // https://github.com/amdjs
        jquery: 'vendor/jquery/jquery',
        backbone: 'vendor/backbone/backbone',
        lodash: 'vendor/lodash/lodash-min',
        localstorage: 'vendor/backbone/backbone.localStorage-min',
        'backbone.fetch-cache': 'vendor/backbone/backbone.fetch.cache.min',
        log4javascript: 'vendor/log4javascript',
        'jquery.cookie': 'vendor/jquery/jquery.cookie.min',
        'jquery-ui': 'vendor/jquery/jquery-ui.min',
        parsley: 'vendor/jquery/parsley',
        moment: 'vendor/moment',
        numeral: 'vendor/numeral.min',
        bootstrap: 'https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/js/bootstrap.min',
        'jquery-layout': 'vendor/jquery/jquery.layout-latest',
        'backbone-super': 'vendor/backbone/backbone-super',
        highstock: 'vendor/highcharts/js/highstock',
        toastr: '//cdnjs.cloudflare.com/ajax/libs/toastr.js/latest/js/toastr'
    },
    shim: {
        underscore: {
            exports: '_'
        },
        'backbone': {
            deps: ['underscore', 'jquery'],
            exports: 'Backbone'
        },
        'backbone.fetch-cache': {
            deps: ['backbone', 'underscore']
        },
        'log4javascript': {
            exports: 'log4javascript'
        },
        'jquery-layout': {deps: ['jquery']},
        'jquery.cookie': ['jquery'],
        'jquery-ui': {deps: ['jquery']},
        toastr: {deps: ['jquery']},
        parsley: {
            deps: ['jquery']
        },
        bootstrap: {
            deps: ['jquery']
        }

    }
});

// Let's kick off the application

require([
    'backbone',
    'underscore',
    'app/router',
    'app/core',
    'app/config/settings',
    'jquery.cookie',
    'bootstrap',
    'toastr'

], function (Backbone, underscore, AppRouter, Core, settings) {
    'use strict';

    _.extend(window, {
        Backbone: Backbone,
        _: underscore,
        core: Core,
        settings: settings.settings,
        sessionModel: settings.session
    });

    $(document).ready(function () {
        var appRouter = new AppRouter();
        _.extend(window, {
            appRouter: appRouter,
        });
    });

});




