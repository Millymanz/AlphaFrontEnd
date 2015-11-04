/**
 * Created with IntelliJ IDEA.
 * User: RDAsante
 * Date: 10/09/15
 * Time: 13:39
 * To change this template use File | Settings | File Templates.
 */

define(['../../views/abstract-view', 'templates'], function(AbstractView, templates) {

	'use strict';

	var AccordionComponentView = AbstractView.extend('AccordionComponentView', {
		model: new Backbone.Model({ style: '', 'title': ''}),
		collection: new Backbone.Collection(),
		template: 'accordion-component-template',
		events: {

		},
		initialize: function(options) {
			options = options || {};
			this.constructor.__super__.initialize.apply(this, arguments);
			///this.render();
                        
                        this.listenTo(this.collection , 'add', this._addNewAccordion);
		},
		render: function() {
			var self = this;
			var accordionModels = this.collection.models;
			var accordionList = [];
			if (accordionModels.length > 0) {
				accordionList = _.map(accordionModels, function(model) {
					var content = model.get('view');
					if (content instanceof Backbone.View) {
						content = content.render().el;
						
					}
					return {
						cid: model.get('cid'),
						label: model.get('label'),
						view: content
					}
				});
			}

			templates.render(this.template, {
				style: this.model.get('style'),
				label: '', //this.model.get('title'),
				panels: accordionList
			}, function(error, output) {
				$(self.el).html(output);

			});
			return this;
		},
		afterRender: function() {
			this.accordianEl = this.$el.find('#accordion');
			var icons = {
				header: "ui-icon-circle-arrow-e",
				activeHeader: "ui-icon-circle-arrow-s"
			};
			$(this.accordianEl).accordion({
				heightStyle: this.getViewOption("heightStyle") ||  "content", //content or fill
				icons: icons

			});

			return this;
		},
		refresh: function() {
			$(this.accordianEl).accordion("refresh");
		},
                _addNewAccordion: function(model){
                    
                    if(!model instanceof Backbone.Model){
                        throw new error('new content must be a model');
                    }
                    
                    var accordionHeader = $('<h3></h3>').html(model.get('label'));
                    var content = model.get('view');
                    
                    if(content instanceof Backbone.View){
                        var contentView = content;
                        content = content.render().el;
                        contentView.delegateEvents();
                    }
                    var accordionContent = $('<div class="accordion-content"></div>').html(content);
                    
                    $(this.el).append(accordionHeader.append(accordionContent));
                    this.refresh();
                }


	});

	return AccordionComponentView;
});