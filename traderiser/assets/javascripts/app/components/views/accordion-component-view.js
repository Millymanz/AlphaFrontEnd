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
			this.render();
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
						content = content[0];
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
			$(this.accordianEl).accordion();

			return this;
		},
		refresh: function() {
			$(this.accordianEl).accordion("refresh");
		}


	});

	return AccordionComponentView;
});