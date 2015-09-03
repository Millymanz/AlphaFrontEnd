define(['./abstract-view', 'templates','./search-box-view', 'parsley'], function (AbtractView, templates, SearchBoxView) {
    'use strict';
    var ENTER_KEY = 13;
    var HomepageView = AbtractView.extend('HomepageView', {
        defaults: {
        },
        events: {
            'click .search-question': 'searchQuestion',
            "keydown": "keyAction",
        },
        template: 'homepage-layout',
        initialize: function (options) {
            this.constructor.__super__.initialize.apply(this, arguments);
            options = options || {};
            this.searchBoxView = new SearchBoxView();
        },
        render: function () {
            var self = this;
            templates.render(this.template, {}, function (error, output) {
                $(self.el).html(output);
            });
            return this;
        },
        searchQuestion: function (evt) {
            var searchForm = $('form');
            if (searchForm.parsley().validate()) {
                //searchForm.submit();
                var searchText = searchForm.find('input');
                appRouter.navigate("search/" + searchText.val(), {trigger: true, replace: true});
            }

        },
        keyAction: function (e) {
            if (e.which === ENTER_KEY) {
                this.searchQuestion(e);
            }
        }
    });

    return HomepageView;
});