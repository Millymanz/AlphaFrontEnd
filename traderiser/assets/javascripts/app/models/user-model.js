/* 
 *  Software Copyright Gyedi PLC 2015. All Rights Reserved.
 * GYEDI, HASHTAGCAMPAIGN.org are trademarks of GYEDI PLC, LONDON
 * plc and may be registered in certain jurisdictions.
 */


/**
 * @desc		stores the POST state and response state of authentication for user
 */
define([
    "../config/settings",
    '../config/rest-utils',
], function (app, restUtils) {


    var UserModel = Backbone.Model.extend({
        initialize: function () {
            _.bindAll.apply(_, [this].concat(_.functions(this)));
        },
        defaults: {
            UserId: 0,
            Username: '',
            FirstName: '',
            LastName: '',
            Email: ''
        },
        getUserProfile: function (callback) {
            {

//                var options = {
//                    				
//                    url: 'Query/GetUserProfile',
//                    method: 'POST',
//                    dataType: 'json',
//                   // contentType: 'application/x-www-form-urlencoded',
//                    processData: { "UserName": this.getUserName()}
//                }
//
//                return restUtils.makeServerRequest(options);

                var self = this;
                var accessSessionToken = sessionModel.getCurrentAccessToken();

                var options = {
                    url: settings.apiBase + '/Query/GetUserProfile',
                    type: "POST",
                    contentType: "application/x-www-form-urlencoded",
                    dataType: 'json',
                    asyc: false,
                    data: JSON.stringify({Username: sessionModel.getUser().getUserName()}),
                    beforeSend: function (request) {
                        request.setRequestHeader("Content-Type", "application/json");
                        request.setRequestHeader("Accept", "application/json");
                        request.setRequestHeader('Authorization', 'Bearer ' + accessSessionToken + ' ');
                        request.setRequestHeader("X-Requested-With", "XMLHttpRequest");
                    },
                    success: function (res) {
                        console.log(res);
                        var userInfo = res.UserProfileConfig;
                        self.set('following', userInfo.Following);
                        self.set('historicQueries', userInfo.HistoricQueries);
                        self.set('savedQueries', userInfo.SavedQueries);
                    },
                    error: function (e) {
                        console.log(e);
                    }
                }

                return $.ajax(options);

            }
        },
        getUserName: function () {
            return this.get('Email') || $.cookie('username');
        },
        followQuery: function (query, callback) {
            {
                return $.ajax({
                    url: "/data/FollowQuery.json",
                    type: "POST",
                    dataType: "text",
                    data: {query: query},
                    success: function (returnedData) {
                        callback(returnedData);
                    }
                });
            }


        }


    });

    return UserModel;
});