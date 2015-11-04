define(['./abstract-view',
    './search-box-view',
    'templates',
    'toastr'], function (AbstractView, SearchBoxView, templates, toastr) {
    'use strict';

    var HeaderView = AbstractView.extend('HeaderView', {
        template: 'header-template',
        events: {
            'click .submit-query': 'getSearchQuery'
        },
        initialize: function (options) {
            options = options || {};
            this.constructor.__super__.initialize.apply(this, arguments);
            this.listenTo(this.model, 'change:showSearch', this._toggleSearchBar);
            this.listenTo(this.model, 'change:showSearchBox', this._toggleSearchBar);
            this.searchBoxView = this.getViewOption('searchBoxView') || new SearchBoxView();
            this.render();
        },
        render: function () {
            var self = this;
            templates.render(this.template, {}, function (error, output) {
                $(self.el).html(output);
            });
            return this;
        },
        afterRender: function () {
            this.searchBoxEl = $(this.el).find('.search-box');
            this.searchBoxEl.html(this.searchBoxView.render().el);
            if (this.model.get('showSearch') && this.model.get('showSearch') === true) {
                this.searchBoxView.model.set('searchText', this.model.get('searchTermText'));
                this.searchBoxView.model.set('showSearchBox', true);
            }
        },
        /**
         * Toggle to show searchbox at the header. this is only shown on search page.
         * @param status
         * @private
         */
        _toggleSearchBar: function (model, status) {
            if (status === true) {
                this.searchBoxView.model.set('searchText', this.model.get('searchTermText'));
                this.searchBoxView.model.set('showSearchBox', true);
            } else {
                this.searchBoxView.model.set('showSearchBox', false);
            }
        },
        getSearchQuery: function (evt) {
            if ($('.searchTextBox').val() !== "") {
                sessionModel.getApplicationWrapperModel().set('searchTermText', $('.searchTextBox').val());
            } else {
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