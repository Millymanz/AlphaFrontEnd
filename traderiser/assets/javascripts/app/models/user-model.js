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
//           return $.ajax({
//                url: "data/GetUserProfile.json",
//                type: "GET",
//                dataType: "text",
//                success: function (returnedData) {
//                    if(callback)
//                            callback(returnedData);
//                        else
//                            return returnedData;
//                }
//                });


                var options = {
                    url: 'Query/GetUserProfile',
                    method: 'POST',
                    dataType: 'text',
                    contentType: 'application/x-www-form-urlencoded',
                    requestData: {username: this.getUserName()}
                }

                return restUtils.makeServerRequest(options);
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