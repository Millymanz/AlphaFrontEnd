define(['./views/homepage-view',
    './views/header-view',
    './views/searchpage-view'], function (HomePageView, HeaderView, SearchPageView) {

    'use strict';

    var AppRouter = Backbone.Router.extend({
        el: $('#app-container'),
        routes: {
            "": "homepage",
            'show/:id': 'show',
            'search/:query': 'searchPage',
            '*actions': 'default'
        },
        initialize: function () {
            var self = this;
            Backbone.history.start();
            //$(this.el).empty();
            var headerView = new HeaderView();
            $('#header').html(headerView.render().el);
        },
        homepage: function () {
            var homepage = new HomePageView();
            $(this.el).html(homepage.render().el);
            return this;
        },
        searchPage: function (query) {
            var searchPageView = new SearchPageView({q: query});
            $(this.el).html(searchPageView.render().el);
            var PageLayout = $('.search-page-view').layout();
            $('body').css({width:'100%',height:'100%'});
            _.extend(window , { PageLayout: PageLayout} );
            return this;
        },
        show: function (id) {
            $(document.body).html("Show route has been called.. with id equals : " + id);
        },
        default: function (actions) {
            $(document.body).html("This route is not hanled.. you tried to access: " + actions);

        }

    });

    return AppRouter;
});