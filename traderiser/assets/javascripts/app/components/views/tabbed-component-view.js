/* 
 *  Software Copyright Gyedi PLC 2015. All Rights Reserved.
 * GYEDI, HASHTAGCAMPAIGN.org are trademarks of GYEDI PLC, LONDON
 * plc and may be registered in certain jurisdictions.
 */

define(['../../views/abstract-view', 'templates' ], function(AbstractView, templates){
   'use strict';
   
   var TabsComponentView = AbstractView.extend('TabsComponentView', {
       model: new Backbone.Model(),
       collection: new Backbone.Collection(),
       template: 'tabbed-component-template',
       initialize: function(options){
           options = options || {};
            this.constructor.__super__.initialize.apply(this, arguments);
           
           this.render();
           
           this.listenTo(this.collection, 'reset', this._redrawTabs);
           this.listenTo(this.model, 'change:style', this._render);
       },
       render: function(){
            var self = this;
            //build the tabs from collection
            
            if(this.collection.models.length> 0){
               var tabsList =  _.map(this.collection.models, function(model){
                   //tablist
                   //tabcontent
                    return {
                        cid: model.cid,
                        label: model.get('label'),
                        active: model.get('active')
                    }
                });
                
                var tabContents = _.map(this.collection.models, function(model){
                     return {
                        cid: model.cid,
                        content: model.get('content'),
                        active: model.get('active')
                    }
                });
            }
            //lets reset active to true for any tabs with no active settings
            var ready = _.matcher({active: true});
            var tabsToGoList = _.filter(tabsList, ready);   
            if(tabsToGoList.length < 0){
                tabsList[0].active = true;
            }
            //tabcontent set active to true
            var tabsContentToGoList = _.filter(tabContents, ready);
            if(tabsContentToGoList.length < 0){
                tabContents[0].active = true;
            }
            templates.render(this.template, {
                style: this.model.get('style'),
                label: this.model.get('title'),
                tabs: tabsList,
                tabcontent: tabContents
                
            }, function (error, output) {
                $(self.el).html(output);
                
            });
            return this;
       },
       afterRender: function(){
           $(this.el).tab('show');
       }
   });
   
   return TabsComponentView;
});
