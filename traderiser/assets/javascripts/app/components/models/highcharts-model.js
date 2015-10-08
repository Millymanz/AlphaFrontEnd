/**
 * Created with IntelliJ IDEA.
 * User: RDAsante
 * Date: 08/10/15
 * Time: 17:49
 * To change this template use File | Settings | File Templates.
 */


define(['backbone'], function(Backbone){
	'use strict';

	var HighChartsModel = Backbone.Model.extend({
		defaults: {
		},
		initialize: function(attrs){
			attrs = attrs || {};
		}
	});

	return HighChartsModel;
});
