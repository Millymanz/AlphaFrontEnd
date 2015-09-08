/* 
 *  Software Copyright Gyedi PLC 2015. All Rights Reserved.
 * GYEDI, HASHTAGCAMPAIGN.org are trademarks of GYEDI PLC, LONDON
 * plc and may be registered in certain jurisdictions.
 */

define(['./abstract-view', 'templates'], function(AbstractView, templates){
   'use strict';
   
   var SearchResultCardItemView = AbstractView.extend('SearchResultCardItemView', {
       template: 'result-card-item-template',
       initialize: function(options){
           options = options  || {};
           
         this.constructor.__super__.initialize.apply(this, arguments);
         this.render();  
       },
       render: function(){
            var self  = this;
            templates.render(this.template, this.model.toJSON(), function(e, o){
                $(self.el).html(o);
            });
       }
   });
   
   return SearchResultCardItemView;
});


