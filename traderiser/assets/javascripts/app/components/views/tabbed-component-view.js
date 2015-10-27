/* 
 *  Software Copyright Gyedi PLC 2015. All Rights Reserved.
 * GYEDI, HASHTAGCAMPAIGN.org are trademarks of GYEDI PLC, LONDON
 * plc and may be registered in certain jurisdictions.
 */

define(['../../views/abstract-view',
	'templates'], function(AbstractView, templates) {
	'use strict';

	var TabsComponentView = AbstractView.extend('TabsComponentView', {
		defaults: {
			template: 'tabbed-component-template'
		},
		model: new Backbone.Model(),
		collection: new Backbone.Collection(),
		template: 'tabbed-component-template',
		initialize: function(options) {
			//this.super(options);
			this.constructor.__super__.initialize.apply(this, arguments);
			$(this.el).tabs();
			//this.render();

			this.listenTo(this.collection, 'reset', this.render);
			this.listenTo(this.collection, 'add', this.render);
			this.listenTo(this.model, 'change:style', this.render);
		},
		render: function() {
			var self = this;
			//build the tabs from collection

			if (this.collection.models.length > 0) {
				var tabsList = _.map(this.collection.models, function(model) {
					//tablist
					//tabcontent
					return {
						cid: model.cid,
						label: model.get('label'),
						active: model.get('active')
					}
				});

				var tabContents = _.map(this.collection.models, function(model) {
					var contentEl = model.get('content');
					return {
						cid: model.cid,
						subview: contentEl,
						content: function(chunk, context, bodies, params) {
							var viewWrapped = context.current();
							var $viewEl = viewWrapped.render().$el;

							//chunk.write($viewEl.html());
							var createdDust = dust.createElement('span', _.bind(function(el) {
								el.parentElement.replaceChild(viewWrapped.el, el); // Replace the span by the Backbone.View
							}));
							return chunk.write(createdDust);
						},
						active: model.get('active')
					}
				});
			}
			//lets reset active to true for any tabs with no active settings
			var ready = _.matcher({active: true});
			var tabsToGoList = _.filter(tabsList, ready);
			if (tabsToGoList.length < 0) {
				tabsList[0].active = true;
			}
			//tabcontent set active to true
			var tabsContentToGoList = _.filter(tabContents, ready);
			if (tabsContentToGoList.length < 0) {
				tabContents[0].active = true;
			}
			this.tabcontent = tabContents;
			templates.render(this.template, {
				style: this.model.get('style'),
				label: this.model.get('title'),
				tabs: tabsList,
				tabcontent: tabContents

			}, function(error, output) {
				$(self.el).html(output);
			});
			return this;
		},
		afterRender: function() {
			var self = this;
			if (this.tabcontent.length > 0) {
				_.each(this.tabcontent, function(content, i){
					var tabContentEl = self.$el.find('#tab-content-'+content.cid);
					var p = content.subview;

					if(content.subview instanceof HTMLElement){
					p =	p.get(0);
					}

					if(content.subview instanceof Backbone.View){
						p = content.subview.render().el;
					}

					return tabContentEl.html(p);
				});
			}
			$(this.el).tabs("refresh");
			return this;
		},
		refresh: function(){
			$(this.el).tabs("refresh");
		}
	});

	return TabsComponentView;
});
