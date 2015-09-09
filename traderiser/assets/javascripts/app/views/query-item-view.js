/* 
 *  Software Copyright Gyedi PLC 2015. All Rights Reserved.
 * GYEDI, HASHTAGCAMPAIGN.org are trademarks of GYEDI PLC, LONDON
 * plc and may be registered in certain jurisdictions.
 */

define(['./abstract-view',
    'templates'], function(AbstractView, templates){
    'use strict';
    
    var QueryItemView = AbstractView.extend('QueryItemView', {
        model: new Backbone.Model(),
        template: 'query-item-template',
        tagName: 'li',
        initialize: function(options){
            options = options || {};
            this.constructor.__super__.initialize.apply(this, arguments);
            this.render();
        },
        
        render: function(){
             var self = this;
            templates.render(this.template, this.model.toJSON(), function (error, output) {
                $(self.el).html(output);
            });
            return this;
        },
        
    });
    
    return QueryItemView;
})
