/**
 * Created with IntelliJ IDEA.
 * User: RDAsante
 * Date: 05/11/15
 * Time: 14:34
 * To change this template use File | Settings | File Templates.
 */


define(['./abstract-view', 'templates'], function(AbstractView, templates){
		'use strict';

	var PageLayoutView = AbstractView.extend('PageLayoutView',{
		defaults: {
			centerPaneSettings: {
						autoResize:				true	// try to maintain pane-percentages
					,	closable:				true
					,	togglerLength_open:		0	// hide toggler-buttons
					,	spacing_closed:			0	// hide resizer/slider bar when closed
					,	autoReopen:				true	// auto-open panes that were previously auto-closed due to 'no room'
					,	autoBindCustomButtons:	true
					,	minSize:				75
					,	center__minWidth:		75
					}
		},
		events: {},
		template: 'page-layout-template',
		initialize: function(options){
			options = options || {};
			this.constructor.__super__.initialize.apply(this, arguments);
		},
		render: function(){
			var self = this;
			templates.render(this.template, {}, function(e, o){
				$(self.el).html(o);
			});

			return this;
		},
		afterRender: function(){
			var tabLayoutSettings = {
					spacing_open:				4
					,	spacing_closed:				4
					,	west__size:					361
					,	east__size:					250
					,	east__fxSpeed:				'fast'
					,	north__minSize:				15
					,	north__spacing_open:		2
					,	north__togglerLength_open:	50
					,	north__togglerLength_close:	-1
				}


			this.pageLayout = $(this.el).layout({ applyDefaultStyles: true });
			//check what has been set
			//centerPane must be a model
			if(this.getViewOption('centerPane') && this.getViewOption('centerPane') instanceof Backbone.Model){
				//set center info and show it. get the settings
				var centerPaneView = this.getViewOption('centerPane').get('view');
				var centerPaneSetting  = this.getViewOption('centerPane').get('settings');
				if(centerPaneView instanceof Backbone.View){
					var centerPane = $(this.el).find('.ui-layout-center');
					centerPane.html(centerPaneView.render().el);
					centerPane.show();
					//this.getPageLayout().panes.center.layout(_.extend(this.defaults.centerPaneSettings, centerPaneSetting ));
				}
			}

		},
		getPageLayout: function(){
			return this.pageLayout;
		}


	});

	return PageLayoutView;

});