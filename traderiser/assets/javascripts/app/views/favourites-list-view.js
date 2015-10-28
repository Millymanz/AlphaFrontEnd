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
            
        },
        render: function(){
            
            this.$el.html('');
            return this;
            
        },
        afterRender: function(){
            var self = this;
            _.each(this.collection.models, function(model){
                var favouriteItemView = new FavouriteItemView({model: model});
                self.$el.append(favouriteItemView.render().el);
            });
        }
        
    });
    
    return FavouriteListView;
})

