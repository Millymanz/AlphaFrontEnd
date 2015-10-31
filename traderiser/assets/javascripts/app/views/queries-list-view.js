/* 
 *  Software Copyright Gyedi PLC 2015. All Rights Reserved.
 * GYEDI, HASHTAGCAMPAIGN.org are trademarks of GYEDI PLC, LONDON
 * plc and may be registered in certain jurisdictions.
 */
define(['./abstract-view',
    './query-item-view',
    'templates'], function(AbstractView, QueryItemView, templates){
    'use strict';

    var QueriesListView = AbstractView.extend('QueriesListView', {
        tagName: 'ul',
        initialize: function(options){
            options = options || {};
            this.constructor.__super__.initialize.apply(this, arguments);
            
            this.render();
        },
        render: function(){
             var self = this;
            return this;
        },
        afterRender: function(){
            var self = this;
            if(this.collection.models.length > 0){
                _.each(this.collection.models, function(model){
                   var queryItemView = new QueryItemView({model: model});
                   queryItemView.on('query-item-clicked', self.itemClicked);
                   $(self.el).append(queryItemView.el);
                });
            }
        },
        itemClicked: function(model){
            this.trigger('query-clicked', model);
            return false;
        }
    });
    
    return QueriesListView;
    
});

