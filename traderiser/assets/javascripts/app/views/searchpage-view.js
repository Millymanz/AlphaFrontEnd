/* 
 *  Software Copyright Gyedi PLC 2015. All Rights Reserved.
 * GYEDI, HASHTAGCAMPAIGN.org are trademarks of GYEDI PLC, LONDON
 * plc and may be registered in certain jurisdictions.
 */
define(['./abstract-view', 'templates','jquery-layout'], function(AbstractView, templates){
    'use strict';
    
    var SearchPageView = AbstractView.extend('SearchPageView', {
        className: 'search-page-view',
        template: 'search-page-template',
        events: {
            
        },
        initialize: function(options){
            options = options || {};
        },
        render: function(){
            var self = this;
            templates.render(this.template,{} ,function(error, output){
                    $(self.el).html(output);
                    
            });
            
            return this;
        }
    });
    
    return SearchPageView;
});

