/* 
 *  Software Copyright Gyedi PLC 2015. All Rights Reserved.
 * GYEDI, HASHTAGCAMPAIGN.org are trademarks of GYEDI PLC, LONDON
 * plc and may be registered in certain jurisdictions.
 */

define(['./abstract-view',
	'templates',
	'./continues-result-item-view', 'toastr'], function(AbstractView, templates, ContinuesResultItemView, toastr){

	'use strict';

	var ContinuesResultsListView = AbstractView.extend('ContinuesResultsListView', {
		collection: new Backbone.Collection(),
		events: {

		},
		className: 'list-group',
		template: 'continues-result-item-template',
		initialize: function(options){
			options = options || {};
			this.constructor.__super__.initialize.apply(this, arguments);
			this.listenTo(this.collection, 'add', this.addNewResult)
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
			if(this.collection.models.length < 1){
				self.$el.html("<p>no continues result to show..</p>");
			}else{

			_.each(this.collection.models, function(model,i){
				if(i == 0){
					model.set('selected', true);
				}
				var resultView = new ContinuesResultItemView({model: model});
				resultView.on('selected-result-card', self.selected);
				self.$el.append(resultView.render().el);
			});

			}
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
			}
		},
		addNewResult: function(result){
			if(result && result instanceof Backbone.Model){
				//add new
				var resultView = new ContinuesResultItemView({model: result});
				resultView.on('selected-result-card', this.selected);
				$(resultView.render().el).prependTo(this.$el);
				//notify user of new addition
				this.sendNotification(resultView);
			}
		},

		sendNotification: function(view){
			var self = this;
			toastr.options = {
				"closeButton": false,
				"debug": false,
				"newestOnTop": true,
				"progressBar": true,
				"positionClass": "toast-bottom-right",
				"preventDuplicates": false,
				"showDuration": "300",
				"hideDuration": "1000",
				"timeOut": "5000",
				"extendedTimeOut": "1000",
				"showEasing": "swing",
				"hideEasing": "linear",
				"showMethod": "fadeIn",
				"hideMethod": "fadeOut"
			}
			toastr.options.onclick  = function() {
				console.log('clicked notification => ' + view.model.get("QueryID"));
				view.trigger("selected-result-card", view.model);
				return false;
			}

			toastr.info("New Result found","" + view.model.get("Query"));
		}
	});

	return ContinuesResultsListView;

});