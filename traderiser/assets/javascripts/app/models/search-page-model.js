/**
 * Created with IntelliJ IDEA.
 * User: RDAsante
 * Date: 10/09/15
 * Time: 15:14
 * To change this template use File | Settings | File Templates.
 */

define(['backbone', '../config/rest-utils'], function(Backbone, restUtils) {
	'use strict';


	var SearchPageModel = Backbone.Model.extend({
		defaults: {
			searchQuery: null,
			showSearchBar: true
		},
		initialize: function(attrs) {
			attrs = attrs || {};
		},

		getAllContinousResults: function(callback) {
			{
				return $.ajax({
					url: "data/GetAllCompletedPatternDefaults.json",
					type: "GET",
					dataType: "text",
					success: function(returnedData) {
						if (callback)
							callback(returnedData);
						else
							return returnedData;
					}
				});
			}
		},

		unfollowQuery: function(query, callback) {
			{
				$.ajax({
					url: "/App/UnfollowQuery",
					type: "POST",
					dataType: "text",
					data: { query: query },
					success: function(returnedData) {
						callback(returnedData);
					}
				});
			}
		},

		followQuery: function(query, callback) {
			{
				$.ajax({
					url: "/App/FollowQuery",
					type: "POST",
					dataType: "text",
					data: { query: query },
					success: function(returnedData) {
						callback(returnedData);
					}
				});
			}
		},


		getAllCompletedPatternDefaults: function(callback) {

			return  $.ajax({
				url: "/data/GetAllCompletedPatternDefaultsTest.json",
				type: "POST",
				dataType: "text",
				success: function(data) {
					if (!callback)
						return data
					else
						callback();
				}
			});

		},
		/**
		 * Return an answer for  query
		 * @param query
		 * @param callback
		 * @param callbackError
		 * @returns {Promise|callback}
		 */
		getAnswer: function(query, callback, callbackError) {

			var options = {
				url: 'Query/GetAnswer',
				method: "POST",
				dataType: "json",
				requestData: { 'Query': query, 'Username': sessionModel.getUser().getUserName() }
			}
			return restUtils.makeServerRequest(options);
		},
		/**
		 * Fetches currency symbol data
		 * @param symbolID
		 * @param timeFrame
		 * @param callback
		 * @param callbackError
		 * @returns {*}
		 */
		fetchSymbolData: function(symbolID, timeFrame, callback, callbackError) {

			return $.ajax({
				url: "/App/GetSymbolData.json",
				method: "POST",
				dataType: "text",
				data: { symbolID: symbolID, timeFrame: timeFrame },
				success: function(returnedData) {
					if (callback) {
						callback(returnedData);
					} else {
						return returnedData;
					}

				},
				error: function(data) {
					// Failure here is valid if the there are no groups in the database, e.g. soon after the database has been cleared.
					alert('ajax call  failed');
				}
			})

		}




	});
	return SearchPageModel;
});