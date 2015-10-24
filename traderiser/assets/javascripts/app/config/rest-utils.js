/* 
 *  Software Copyright Gyedi PLC 2015. All Rights Reserved.
 * GYEDI, HASHTAGCAMPAIGN.org are trademarks of GYEDI PLC, LONDON
 * plc and may be registered in certain jurisdictions.
 */
define(['../core/logging', 'toastr'], function (logger, toastr) {
    'use strict';

    $.ajaxSetup({
        cache: false,
        statusCode: {
            401: function () {
                // Redirect the to the login page. Authorised user
								toastr.error('Opps! Not Authorised');
								$.cookie('logged_in', 'false');
								setTimeout(function(){
									window.location.replace('/#login');
								}, 2000)

            },
            403: function () {
                // 403 -- Access denied
                window.location.replace('/#denied');
            },
					error: function(error){
						toastr.error(error);
					}
        }
    });

    var accept = ' application/*+json';

    var restUtils = {
        baseUrl: function (serverOnly) {
            var url = '';
            if (serverOnly) {
                url = settings.serverUrl;
            } else {
                url = settings.apiBase;
            }
            return url;
        },
        /**
         * options.url
         * options.data
         * options.method,
         * options.dataType,
         * 
         * @param {Object} options
         * @returns {undefined}
         */
        makeServerRequest: function (options) {
            var requestOptions = {};
            if (options.url === "") {
                logger.error('TradeRiser REST request failed - no URL set [' + options.url + ']');
                return false;
            }
            // Set any request options which are always the same.
//           $.support.cors = true; // Fix to stop "No transport" error for AJAX requests on IE < 10
            requestOptions.crossDomain = true;
            requestOptions.xhrFields = {
                withCredentials: false // Required to be true for CORS to send cookies.
            };

            var accessSessionToken = sessionModel.getCurrentAccessToken();
            if (accessSessionToken !== undefined || accessSessionToken !== null) {
                requestOptions.beforeSend = function (request) {
									request.setRequestHeader("Content-Type","application/json");
									request.setRequestHeader("Accept", "application/json");
                  request.setRequestHeader('Authorization', 'Bearer ' + accessSessionToken + ' ');
                };

            }

            if (options.contentType != null) {
                requestOptions.contentType = options.contentType;
            }

            if (options.requestData != null) {
                requestOptions.data = options.requestData;
            }

            if (options.processData != null) {
                requestOptions.processData = JSON.stringify(options.processData);
            }

            var urlBase = this.baseUrl();
            if (options.serverOnly != null) {
                urlBase = this.baseUrl(options.serverOnly);
            }

            // Set any configurable request options.
            requestOptions.method = options.method || 'GET';

            requestOptions.url = urlBase + '/' + options.url; // Make combined URL.


            if (options.dataType !== null) {
                requestOptions.dataType = options.dataType;
            }
            requestOptions.dataType = options.dataType !== null ? options.dataType : 'json'; // dataType tells jQuery the type of data we expect.

            if(options.accepts	!== null){
							requestOptions.accepts = {// accepts configures the Accept header content based on the dataType.
								json: accept
							};
						}

            return  $.ajax(requestOptions);
        }
    };


    return restUtils;
});

