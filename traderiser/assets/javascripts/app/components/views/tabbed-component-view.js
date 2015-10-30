/* 
 *  Software Copyright Gyedi PLC 2015. All Rights Reserved.
 * GYEDI, HASHTAGCAMPAIGN.org are trademarks of GYEDI PLC, LONDON
 * plc and may be registered in certain jurisdictions.
 */

define(['../../views/abstract-view',
	'templates'], function(AbstractView, templates) {
	'use strict';

	var TabExTabView = Backbone.View.extend({

		initialize: function() {
			_.bindAll(this, 'render');
			this.model.bind('change', this.render);
		},

		render: function() {
			// add the actual content
			var content = this.model.get('content');
			var ulEl = '<li role="presentation"><a href="#tab-content-'+this.model.cid+'" aria-controls="{cid}" role="tab" data-toggle="tab">'+this.model.label+'</a></li>'
			if(this.model.get('content') instanceof Backbone.View){
				content  = this.model.get('content').render().el;
			}
			$(this.el).html('<div id="tab_' + this.model.cid + '">'
				+ content
				+ '<br /><br /><br />'
				+ '<a href="#" class="deleter" id="' + this.model.cid
				+ '">Delete this tab</a></div>');


			return this;
		}
	});

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


			//this.listenTo(this.collection, 'reset', this.render);
			this.listenTo(this.collection, 'add', this._addNewTab);
			this.listenTo(this.model, 'change:style', this.render);

		},
		render: function() {
			var self = this;
			//build the tabs from collection
			var tabContents = [];
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

				tabContents = _.map(this.collection.models, function(model) {
					var contentEl = model.get('content');
					return {
						cid: model.cid,
						subview: contentEl,
						active: model.get('active')
					}
				}) || [];
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

			$(this.el).tabs({
				activate: function( event, ui ) {
					setTimeout(function() {
						// resizeEnd call function with pass context body
						//alert('resize');
						$(window).resize();
					}, 1000);
				}
			});
			return this;
		},
		afterRender: function() {
			var self = this;
			if (this.tabcontent.length > 0) {
				_.each(this.tabcontent, function(content, i){
					var tabContentEl = self.$el.find('#tab-content-'+content.cid);
					tabContentEl.empty();
					var p = content.subview;

					if(content.subview instanceof HTMLElement){
					p =	p.get(0);
					}

					if(content.subview instanceof Backbone.View){
						p = content.subview.render().el;
						content.subview.delegateEvents();
					}
					return tabContentEl.html(p);
				});
			}
			//$(this.el).tabs("refresh");
			return this;
		},
		/**
		 * Add a new tab to the tabs container
		 * @param model
		 * @private
		 */
		_addNewTab: function(model){

			//find ul
			var content = model.get('content');

			var tabsUL = $(this.el).find('.nav-tabs');
			var active = '';
			var activeID = 1;
			if(model.get('active')){
				active = 'active';
				activeID = '#tab-content-'+model.cid;
			}
			var ulappendEl = '<li role="presentation"><a href="#tab-content-'+model.cid+'" class="'+active+'"   aria-controls="'+model.cid+'" role="tab" data-toggle="tab">'+model.get('label')+'</a></li>';
			var contentEl = '<div role="tabpanel" class="tab-pane '+active+'" id="tab-content-'+model.cid+'"></div>';

			var tabContent = $(this.el).find('.tab-content');
			$(tabsUL).append(ulappendEl);
			if(content instanceof Backbone.View){
				var contentView = content;
				content = content.render().el;
				contentView.delegateEvents();
			}
			$(tabContent).append($(contentEl).html(content));

			//this.refresh();
			var activeTab = $(this.el).tabs("option", "active");
			if(activeTab == false){
				$(this.el).tabs( {active: activeID } );
				$(this.el).tabs("refresh");
			}

		},
		refresh: function(){
			$(this.el).tabs("refresh");

		}
	});

	return TabsComponentView;
});
