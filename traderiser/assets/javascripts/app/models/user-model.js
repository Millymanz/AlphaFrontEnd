/* 
 *  Software Copyright Gyedi PLC 2015. All Rights Reserved.
 * GYEDI, HASHTAGCAMPAIGN.org are trademarks of GYEDI PLC, LONDON
 * plc and may be registered in certain jurisdictions.
 */


/**
 * @desc		stores the POST state and response state of authentication for user
 */
define([
    "../config/settings"
], function(app){

    var UserModel = Backbone.Model.extend({

        initialize: function(){
           _.bindAll.apply(_, [this].concat(_.functions(this)));
        },

        defaults: {
            id: 0,
            username: '',
            name: '',
            email: ''
        },

        url: function(){
            return app.apiBase + '/user';
        }

    });
    
    return UserModel;
});