define(['./abstract-view','templates'], function(AbtractView, templates){
	'use strict';

	var HomepageView = AbtractView.extend('HomepageView', {
		defaults: {

		},
		template: 'homepage-layout',
		initialize: function(options){
			options = options || {};
			console.log('homepage layout');
		},
		render: function(){
			var self = this;
			templates.render(this.template, {}, function(error, output){
				$(self.el).html(output);
			});

			return this;
		}
	});

	return HomepageView;
})