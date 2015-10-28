/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

define(['./abstract-view', 'templates'], function(AbstractView, templates){
	'use strict';

	var FollowingItemView = AbstractView.extend('FavouriteItemView', {
		template: 'following-query-template',
		className: 'list-group-item',
		events: {
			'click button.action-view': 'clickActionView',
			'click button.action-unsave': 'clickActionUnsave'
		},
		initialize: function(options){
			options = options || {};

			this.constructor.__super__.initialize.apply(this, arguments);

			if(this.model && this.model == undefined){
				throw new error('Model is required for this view');
			}


		},
		render: function(){
			var self = this;
			templates.render(this.template, this.model.toJSON(),function(e,o){
				self.$el.html(o);
			});

			return this;
		},
		clickActionView: function(e){
			this.trigger('action-view-follow-query-selected', this.model);
			return false;
		},
		clickActionUnsave: function(e){
			this.trigger('action-unfollow-query-selected', this.model);
			return false;
		}
	});

	return FollowingItemView;
});

