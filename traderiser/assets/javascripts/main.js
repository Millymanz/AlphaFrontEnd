// Require.js allows us to configure shortcut alias
// Their usage will become more apparent futher along in the tutorial.

require.config({
    paths: {
        // Major libraries
        underscore: 'vendor/underscore/underscore', // https://github.com/amdjs
        jquery: 'vendor/jquery/jquery',
        backbone: 'vendor/backbone/backbone.1.1',
        localstorage: 'vendor/backbone/backbone.localStorage-min',
        'backbone.fetch-cache': 'vendor/backbone/backbone.fetch.cache.min',
        log4javascript: 'vendor/log4javascript',
        'jquery.cookie': 'vendor/jquery/jquery.cookie.min',
        'jquery-ui': 'vendor/jquery/jquery-ui.min',
        // Require.js plugins
        parsley: 'vendor/jquery/parsley',
        moment: 'vendor/moment',
        numeral: 'vendor/numeral.min',
        bootstrap: 'https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/js/bootstrap.min',
        'jquery-layout': 'vendor/jquery/jquery.layout-latest',
        'backbone-super': 'vendor/backbone/backbone-super'
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
        'jquery-layout': { deps: ['jquery'] },
        'jquery.cookie': ['jquery'],
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
    'app/router',
    'app/core',
    'app/config/settings',
    'app/models/session-model',
    'jquery.cookie',
    'bootstrap'
    
], function (AppRouter, Core, Settings, SessionModel) {
    'use strict';
    
    $(document).ready(function() { 
        
        var app = new AppRouter();
       _.extend(window, {
           appRouter: app,
            settings: Settings,
            core: Core,
            SessionModel: SessionModel
       });
   });

});




