/* 
 *  Software Copyright Gyedi PLC 2015. All Rights Reserved.
 * GYEDI, HASHTAGCAMPAIGN.org are trademarks of GYEDI PLC, LONDON
 * plc and may be registered in certain jurisdictions.
 */

define(['./abstract-view',
    'templates',
    '../collections/search-results-collection'], function(AbstractView, templates, SearchResultsCollection){
   
    'use strict';
    
    var SearchResultsView = AbstractView.extend('SearchResultsView', {
        tagName: 'ul',
        template: 'search-results',
        initialize: function(options){
            options = options || {};
            this.constructor.__super__.initialize.apply(this, arguments);

            var searchTerm;
            if(options && options.searchTerm){
                searchTerm = options.searchTerm;
            }
            this.collection = new SearchResultsCollection({searchTerm : ''});
            
            this.render();
        },
        render: function(){
            var self  = this;
            templates.render(this.template, {}, function(e, o){
                $(self.el).html(o);
            });
        },
        afterRender: function(){
            var self = this;
            this.collection.fetch({
                success: function(data){
                    $(self.el).append()
                }
            })
        }
    });
    
    return SearchResultsView;
    
});