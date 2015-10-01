/*
 * Software Copyright Gyedi PLC 2014. All Rights Reserved.
 * GYEDI, HASHTAGCAMPAIGN.org are trademarks of GYEDI PLC, LONDON
 * plc and may be registered in certain jurisdictions.
 */

define([
    "jquery",
    "underscore",
    "backbone",
    '../models/session-model'
], function ($, _, Backbone, sessionModel) {

    'use strict';
    var baseUrl = '//devapi.traderiser.com';

    var Settings = {
				serverUrl: baseUrl,
        apiBase: baseUrl + '/api',
        deBugMode: true,
        // Show alert classes and hide after specified timeout
        showAlert: function (title, text, klass) {
            $("#header-alert").removeClass("alert-danger alert-warning alert-success alert-info");
            $("#header-alert").addClass(klass);
            $("#header-alert").html('<button class="close" data-dismiss="alert">×</button><strong>' + title + '</strong> ' + text);
            $("#header-alert").show('fast');
            setTimeout(function () {
                $("#header-alert").hide();
            }, 7000);
        }
    };

    // Global event aggregator
    Settings.eventAggregator = _.extend({}, Backbone.Events);

    // View.close() event for garbage collection
    Backbone.View.prototype.close = function () {
        this.remove();
        this.unbind();
        if (this.onClose) {
            this.onClose();
        }
    };



    return {
        settings: Settings,
        session: new sessionModel()
    };


});