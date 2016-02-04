// Require.js allows us to configure shortcut alias
// Their usage will become more apparent futher along in the tutorial.

if (typeof DEBUG === 'undefined')
    DEBUG = true;

require.config({
    paths: {
        // Major libraries
        underscore: 'vendor/underscore/underscore', // https://github.com/amdjs
        jquery: 'vendor/jquery/jquery',
        dustCore: 'vendor/dust/dust',
        dustHelpers: 'vendor/dust/dust-helpers',
        backboneCore: 'vendor/backbone/backbone',
        'backbone-super': 'vendor/backbone/backbone-super',
        localstorage: 'vendor/backbone/backbone.localStorage-min',
        'backbone.fetch-cache': 'vendor/backbone/backbone.fetch.cache.min',
        log4javascript: 'vendor/log4javascript',
        'jquery.cookie': 'vendor/jquery/jquery.cookie.min',
        'jquery-ui': 'vendor/jquery/jquery-ui.min',
        parsley: 'vendor/jquery/parsley',
        moment: 'vendor/moment',
        numeral: 'vendor/numeral.min',
        bootstrap: 'vendor/bootstrap/bootstrap.min',
				drawer: 'vendor/bootstrap/drawer',
        'jquery-layout': 'vendor/jquery/jquery.layout-latest',
        highstock: 'vendor/highcharts/js/highstock',
        toastr: '//cdnjs.cloudflare.com/ajax/libs/toastr.js/latest/js/toastr',
        dynatable: 'vendor/jquery/jquery.dynatable',
        'highstock-ext': 'vendor/highcharts/js/highstock-ext',
        'dust-dom': 'vendor/dust/dust.dom',
        'backbone-dust-helpers': 'vendor/dust/dust.backbone-helpers',
        //wrappers
        dust: './app/wrappers/dust',
        backbone: './app/wrappers/backbone'
    },
    shim: {
        underscore: {
            exports: '_'
        },
        'backboneCore': {
            deps: ['underscore', 'jquery'],
            exports: 'BackboneCore'
        },
        'backbone.fetch-cache': {
            deps: ['backboneCore', 'underscore']
        },
        'backbone-super': {deps: ['backboneCore']},
        'log4javascript': {
            exports: 'log4javascript'
        },
        'jquery-layout': {deps: ['jquery']},
        dynatable: {deps: ['jquery']},
        'jquery.cookie': ['jquery'],
        'jquery-ui': {deps: ['jquery']},
        toastr: {deps: ['jquery']},
        parsley: {
            deps: ['jquery']
        },
				drawer: {
						deps: ['bootstrap']
				},
        bootstrap: {
            deps: ['jquery']
        },
        'highstock-ext': {deps: ['highstock']}
    }
});

// Let's kick off the application

define([
    'backbone',
    'underscore',
		'jquery',
    'app/router',
    'app/core',
    'app/config/settings',
    'dust',
		'app/components',
		'app/views',
    'jquery.cookie',
    'bootstrap',
    'dynatable',
    'toastr',
    'dust-dom'

], function (Backbone, underscore, jquery, AppRouter, Core, settings, dust, Components, Views) {
    'use strict';
		window.traderiser = window.traderiser || {};
		traderiser.core = Core;
		traderiser.components = Components;
		traderiser.views = Views;

    _.extend(window, {
        Backbone: Backbone,
        _: underscore,
				$: jquery,
        core: Core,
        settings: settings.settings,
        sessionModel: settings.session,
        dust: dust
    });
	traderiser.router = new AppRouter;
	return traderiser;

});




