/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

define(['./abstract-view','./following-item-view'], function(AbstractView, FollowingItemView){

	'use strict';

	var FollowingResultsListView = AbstractView.extend('FollowingResultsListView',{
		className: 'list-group',
		initialize: function(options){
			options = options || {};
			this.constructor.__super__.initialize.apply(this, arguments);

			if(options && options.collection.length < 0){
				throw new error("View requires a backbone colllection")
			}

			this.collection = options.collection || this.viewOption('collection');

			this.collection.on("following-remove-query", this.render);

		},
		render: function(){
			this.$el.html("");
			return this;

		},
		afterRender: function(){
			var self = this;
			if(this.collection.models < 0){
				this.$el.html("nothing to show...");
			}
			_.each(this.collection.models, function(model){
				var followingItemView = new FollowingItemView({model: model});
				followingItemView.on('action-view-follow-query-selected',self.viewSelectedQuery);
				followingItemView.on('action-unfollow-query-selected',self.unSaveSelectedQuery);
				self.$el.append(followingItemView.render().el);
			});
		},
		viewSelectedQuery: function(model){
			this.trigger('following-selected-query', model);
			if(DEBUG){ console.log('click on view Following query => ' + model.get('Query')); }
			return false;
		},
		unSaveSelectedQuery: function(model){
			this.trigger('following-unfollow-query', model);
			if(DEBUG){ console.log('click on unfollow query => ' + model.get('QueryID')); }
			return false;
		}


	});

	return FollowingResultsListView;
})

