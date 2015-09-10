/**
 * Created with IntelliJ IDEA.
 * User: RDAsante
 * Date: 10/09/15
 * Time: 15:14
 * To change this template use File | Settings | File Templates.
 */

define(['backbone'], function(Backbone){
	'use strict';


	var SearchPageModel = Backbone.Model.extend({
		defaults: {
			searchQuery: '',
			showSearchBar: true,
		},
		initialize: function(attrs){
			attrs = attrs || {};
		},

		getAllContinousResults: function (callback) {
		{
			return $.ajax({
				url: "data/GetAllCompletedPatternDefaults.json",
				type: "GET",
				dataType: "text",
				success: function (returnedData) {
					if(callback)
						callback(returnedData);
					else
					return returnedData;
				}
			});
		}
	},


		getAllCompletedPatternDefaults: function(callback){

				return  $.ajax({
					url: "/data/GetAllCompletedPatternDefaultsTest.json",
					type: "POST",
					dataType: "text",
					success: function (data) {
						if(!callback)
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
		getAnswer : function (query, callback, callbackError) {
			if(this.get('searchQuery') !== ""){
				query = this.get('searchQuery');
			}
			return 	$.ajax({
					url: "/data/GetAnswer.json",
					type: "POST",
					dataType: "text",
					data: { searchQuery: query },
					success: function (returnedData) {
						if(callback && callback instanceof  Function)
							callback(returnedData);
						else
							return returnedData
					},
					error: function (data) {
						// Failure here is valid if the there are no groups in the database, e.g. soon after the database has been cleared.
						alert('ajax call  failed');
					}
				});
		},
		/**
		 * Fetches currency symbol data
		 * @param symbolID
		 * @param timeFrame
		 * @param callback
		 * @param callbackError
		 * @returns {*}
		 */
		fetchSymbolData: function (symbolID, timeFrame, callback, callbackError) {

		return $.ajax({
			url: "/App/GetSymbolData.json",
			type: "POST",
			dataType: "text",
			data: { symbolID: symbolID, timeFrame: timeFrame },
			success: function (returnedData) {
				if(callback){
					callback(returnedData);
				}else{
					return returnedData;
				}

			},
			error: function (data) {
				// Failure here is valid if the there are no groups in the database, e.g. soon after the database has been cleared.
				alert('ajax call  failed');
			}
		})

	}




});
return SearchPageModel;
});