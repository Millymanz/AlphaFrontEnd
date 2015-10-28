/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

define(['./abstract-view','./favourite-item-view'], function(AbstractView, FavouriteItemView){
    
    'use strict';
    
    var FavouriteListView = AbstractView.extend('FavouriteListView',{
        className: 'list-group',
        initialize: function(options){
            options = options || {};
            this.constructor.__super__.initialize.apply(this, arguments);
            
            if(options && options.collection.length < 0){
                throw new error("View requires a backbone colllection")
            }
            
            this.collection = options.collection || this.viewOption('collection');

					this.collection.on("remove", this.render);
            
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
                var favouriteItemView = new FavouriteItemView({model: model});
								favouriteItemView.on('action-view-saved-query-selected',self.viewSelectedQuery);
								favouriteItemView.on('action-unsaved-saved-query-selected',self.unSaveSelectedQuery);
                self.$el.append(favouriteItemView.render().el);
            });
        },
				viewSelectedQuery: function(model){
					this.trigger('favourite-selected-query', model);
					if(DEBUG){ console.log('click on view saved query => ' + model.get('Query')); }
					return false;
				},
				unSaveSelectedQuery: function(model){
					this.trigger('favourite-unsave-query', model);
					if(DEBUG){ console.log('click on unsave query => ' + model.get('Query')); }
					return false;
				}

        
    });
    
    return FavouriteListView;
})

