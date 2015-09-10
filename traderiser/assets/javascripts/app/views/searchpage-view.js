/* 
 *  Software Copyright Gyedi PLC 2015. All Rights Reserved.
 * GYEDI, HASHTAGCAMPAIGN.org are trademarks of GYEDI PLC, LONDON
 * plc and may be registered in certain jurisdictions.
 */
define(['./abstract-view',
				'../components/views/accordion-component-view',
				'templates',
				'../models/search-page-model',
	 			'jquery-layout'], function(AbstractView, AccordionComponentView, templates, SearchPageModel){
    'use strict';
    
    var SearchPageView = AbstractView.extend('SearchPageView', {
				model: new SearchPageModel(),
        template: 'search-page-template',
        events: {
            
        },
        initialize: function(options){
            options = options || {};
					this.constructor.__super__.initialize.apply(this, arguments);
					if(options.q !== ""){
						this.question = options.q;
					}
					this.render();

					this.showGraph();
        },
        render: function(){
            var self = this;
            templates.render(this.template,{} ,function(error, output){
                    $(self.el).html(output);
                    
            });
            
            return this;
        },
				afterRender: function(){

					var accordionCollection = new Backbone.Collection();
					accordionCollection.add(new Backbone.Model({ label : 'one', view: new Backbone.View({$el: 'some random information'})}));
					accordionCollection.add(new Backbone.Model({ label : 'two', view: new Backbone.View({$el: 'some random information'})}));
					accordionCollection.add(new Backbone.Model({ label : 'two', view: 'some more content'}));


					var accordionComponentView = new AccordionComponentView({model: new Backbone.Model({ style: 'simple', title: 'latest information' }), collection: accordionCollection});
					console.log(accordionComponentView.el);
				},

			showGraph: function(){
				this.model.getAllContinousResults().then(function(data){
					//console.log(data);
					var rawData = 	sessionModel.getApplicationWrapperModel().getAllContinousResultsCards(data);
					console.log(rawData);
				})
			}
    });
    
    return SearchPageView;
});

