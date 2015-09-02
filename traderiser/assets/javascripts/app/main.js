// Require.js allows us to configure shortcut alias
// Their usage will become more apparent futher along in the tutorial.

require.config({
    paths: {
        // Major libraries
        underscore: '../vendor/underscore/underscore', // https://github.com/amdjs
        jquery: 'vendor/jquery/jquery',
        backbone: 'vendor/backbone/backbone.1.1',
        localstorage: 'vendor/backbone/backbone.localStorage-min',
        'backbone.fetch-cache': 'vendor/backbone/backbone.fetch.cache.min',
        log4javascript: 'vendor/log4javascript',
        'jquery.cookie': 'vendor/jquery/jquery.cookie.min',
        'jquery-ui': 'vendor/jquery/jquery-ui.min',
        // Require.js plugins
        text: 'vendor/require/text',
        parsley: 'vendor/jquery/parsley',
        moment: 'vendor/moment',
        numeral: 'vendor/numeral.min',
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
        'jquery.cookie': ['jquery'],
        parsley: {
            deps: ['jquery']
        },
    }
});

// Let's kick off the application

require([
    'app/router',
    'app/core',
    './config/settings',
    'app/models/session-model',
    'jquery.cookie',
    'underscore'
    
    
], function (AppRouter, Core, Settings, SessionModel,underscore) {
    'use strict';
    
    _.extend(window, {
        _: underscore,
        settings: Settings,
        core: Core,
        SessionModel: SessionModel
    });
    
    $(document).ready(function() { 
        
        var app = new AppRouter();
       _.extend(window, {
           appRouter: app
       });
   });

});




