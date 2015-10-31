/**
 * Created with IntelliJ IDEA.
 * User: RDAsante
 * Date: 07/10/15
 * Time: 14:22
 * To change this template use File | Settings | File Templates.
 */

define(['../config/rest-utils','backbone'], function(restUtils, Backbone){
	'use strict';

	var HeartBeat = Backbone.Model.extend({
		defaults: {
			callbackFunction: ''
		},
		initialize: function(attrs){
			attrs = attrs || {};
		},
		start: function(callback){
			if(callback && !callback instanceof Function){
				throw new Error('Call back must be a function');
			}
			this.set('callbackFunction', callback);
			this._makeHeartProcess();
		},
		/**
		 * Make function that makes the rest;
		 * @private
		 */
		_makeHeartProcess: function(){
			var self = this;
			var options = {
				url: 'UserAuth/SessionTokenActive',
				method: 'GET',
				contentType: 'application/x-www-form-urlencoded'
			}

			restUtils.makeServerRequest(options).then(function(data){
					if(self.get('callbackFunction')){
						if (DEBUG) console.log('Token key is active => ' + data);
						self.get('callbackFunction')(data);
					}

			}).done(function(){
					self._setTimeOutFunction = setTimeout(function(){
						self._makeHeartProcess();
					}, 50000);
				});
		},
		/**
		 * Kill the heart beat
		 */
		stop: function(){
			clearTimeout(this._setTimeOutFunction);
		}


	});

	return HeartBeat;

});