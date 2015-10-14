define(['./abstract-view', 'templates','toastr'], function(AbstractView, templates, toastr) {
	'use strict';

	var HeaderView = AbstractView.extend('HeaderView', {
		template: 'header-template',
		events: {
			'click .submit-query': 'getSearchQuery'
		},
		initialize: function(options) {
			options = options || {};
			this.constructor.__super__.initialize.apply(this, arguments);
			this.listenTo(this.model, 'change:showSearch', this._toggleSearchBar);

			this.render();

		},
		render: function() {
			var self = this;
			templates.render(this.template, {}, function(error, output) {
				$(self.el).html(output);
			});
			return this;
		},
		afterRender: function() {
			this.searchBoxEl = $(this.el).find('.search-box');
			if(this.model.get('showSearch') && this.model.get('showSearch') === true){
				this.searchBoxEl.show();
				this.searchBoxEl.find('input').val(this.model.get('searchTermText'))
			}
		},
		/**
		 * Toggle to show searchbox at the header. this is only shown on search page.
		 * @param status
		 * @private
		 */
		_toggleSearchBar: function(model, status) {
			if (status === true) {
				this.searchBoxEl.show();
			} else {
				this.searchBoxEl.hide();
			}
		},
		getSearchQuery: function(evt) {
			if($('.searchTextBox').val() !== ""){
			sessionModel.getApplicationWrapperModel().set('searchTermText', $('.searchTextBox').val());
			}else{
				toastr.options = {
					"closeButton": false,
					"debug": false,
					"newestOnTop": false,
					"progressBar": true,
					"positionClass": "toast-top-full-width",
					"preventDuplicates": true,
					"onclick": null,
					"showDuration": "300",
					"hideDuration": "1000",
					"timeOut": "5000",
					"extendedTimeOut": "1000",
					"showEasing": "swing",
					"hideEasing": "linear",
					"showMethod": "fadeIn",
					"hideMethod": "fadeOut"
				}
				toastr.error('Please enter some search text!');

			}
			return false;
		}

	});
	return HeaderView;
});