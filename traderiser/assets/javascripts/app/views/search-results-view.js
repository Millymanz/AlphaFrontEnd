/* 
 *  Software Copyright Gyedi PLC 2015. All Rights Reserved.
 * GYEDI, HASHTAGCAMPAIGN.org are trademarks of GYEDI PLC, LONDON
 * plc and may be registered in certain jurisdictions.
 */

define(['./abstract-view',
    'templates',
		'./search-result-card-item-view',
    '../collections/search-results-collection'], function(AbstractView, templates, SearchResultCardItemView, SearchResultsCollection){
   
    'use strict';
    
    var SearchResultsView = AbstractView.extend('SearchResultsView', {
				events: {

				},
				className: 'list-group',
        template: 'search-results',
        initialize: function(options){
            options = options || {};
            this.constructor.__super__.initialize.apply(this, arguments);

					if(!options.collection && options.collection.length < 0){
						throw new error("Collection is required to create this");
					}
        },
        render: function(){
            var self  = this;
            templates.render(this.template, {}, function(e, o){
                $(self.el).html(o);
            });

					return this;
        },
        afterRender: function(){
            var self = this;
					_.each(this.collection.models, function(model,i){
						if(i == 0){
							model.set('selected', true);
						}
						var resultView = new SearchResultCardItemView({model: model});
						resultView.on('selected-result-card', self.selected);
						self.$el.append(resultView.render().el);
					});
        },
			/**
			 * Go through collection and set deselect for all other models
			 * @param model
			 * @param val
			 * @param opts
			 */
				selected: function(model, val, opts) {
					if( model ){
						this.collection.each( function( e ){
							if( e != model && e.get( "selected" ) ) e.set( "selected", false );
						});
					};
				}
    });
    
    return SearchResultsView;
    
});