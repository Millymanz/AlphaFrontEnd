/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

define(['backbone'], function (Backbone) {
    'use strict';

    var SessionModel = Backbone.Model.extend({
        url: settings.apiBase + 'user/authentication',
        defaults: {
            userId: 0,
            userName: null,
            loggedIn: false
        },
        initialize: function (attrs) {
            this.attrs = attrs || this.defaults;
        },
        checkLoggedIn: function () {
            //check loggedIn User
        },
        logUserOut: function () {
            var self = this;
            $.ajax({url: settings.apiBase + 'logout',
                success: function (data) {
                    console.log(data);
                    $.cookie('user_id', 0);
                    $.cookie('user_name', '');
                    $.cookie('loggedIn', 'false');
                    // set model

                    self.set('loggedin', false);
                    self.set('userId', 0);
                    self.set('loggedIn', false);

                },
                type: 'POST'
            });

        }


    });

    return new SessionModel();
});

