/**
 * Created with IntelliJ IDEA.
 * User: RDAsante
 * Date: 08/10/15
 * Time: 17:39
 * To change this template use File | Settings | File Templates.
 */
define(['backbone'], function(Backbone){
	'use strict';

	var SerieModel = Backbone.Model.extend({

		defaults: {
			title : '',
			style: '' //tabs-left tabs-right
		},
		initialize: function(attrs){
			attrs = attrs || {};
			this.highChartsId = (attrs || {}).highChartsId || parseInt(_.uniqueId());
		},
		toHighChartsData: function () {
			return $.extend(true, {}, this.toJSON(), {id: this.highChartsId});
		},

		addPoint: function (pt) {
			this.set('data', this.get('data').concat([pt]), {silent: true});
			this.trigger('add:point', this, pt);
		}
	});

	return SerieModel;
});
