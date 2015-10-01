/**
 * Created with IntelliJ IDEA.
 * User: RDAsante
 * Date: 10/09/15
 * Time: 16:52
 * To change this template use File | Settings | File Templates.
 */

define(['../../views/abstract-view', 'templates'], function(AbstractView, Templates){
	'use strict';

	var HighChartComponentView = AbstractView.extend('HighChartComponentView', {
		defaults: {},
		initialize: function(options){
			options = options || options ;
			this.contructor.__super__.initialize.apply(this, arguments);
			this.el.empty();

			this.render();
		},
		render: function(){

		}
	});

	return HighChartComponentView;

});