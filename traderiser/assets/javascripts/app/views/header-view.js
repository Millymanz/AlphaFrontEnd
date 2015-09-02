define(['backbone','templates'], function(Backbone,templates){
	'use strict';

	var HeaderView = Backbone.View.extend({
	template: 'header-template',
	initialize: function(options){
		options = options || {};

	},
	render: function(){
		var self = this;
		 templates.render(this.template, {}, function(error, output) {
        	$(self.el).append(output);
      });
      return this;
	}

	});
	return HeaderView;
});