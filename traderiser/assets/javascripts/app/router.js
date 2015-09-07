define([
    './views/homepage-view',
    './views/header-view',
    './views/searchpage-view',
    './views/login-view'], function (HomePageView, HeaderView, SearchPageView, LoginPageView) {

    'use strict';
    var loggedIn = function () {
        sessionModel.checkAuth({
            success: function (res) {
                // If auth successful, render inside the page wrapper
                $('#content').html(self.currentView.render().$el);
            }, error: function (res) {
                self.navigate("/", {trigger: true, replace: true});
            }
        });
        return false;
    }

    var goToLogin = function () {
        console.log('ok');
    }

    var AppRouter = Backbone.Router.extend({
        el: $('#app-container'),
        execute: function(callback, args, name) {
            console.log('checking');
           if(name != 'showLoginPage'){
               //check loggion
               if(sessionModel.get('logged_in') == true){
                   if (callback) callback.apply(this, args);
               }else{
                   this.showSearchBox = false;
                   this.navigate("/", {trigger: true, replace: true});
               }
           }else{
               if (callback) callback.apply(this, args);
           } 
           //if (callback) callback.apply(this, args);
        },
        routes: {
            '': "showLoginPage",
            'main': "homepage",
            'show/:id': 'show',
            'search/:query': 'searchPage',
            '*actions': 'default'
        },
        initialize: function () {
            var self = this;
            Backbone.history.start();
            //$(this.el).empty();
            this.options = {requiresAuth: true};
        },
        homepage: function () {
            var homepage = new HomePageView();
            this.show(homepage, this.options);
            //$(this.el).html(homepage.render().el);
            return this;
        },
        searchPage: function (query) {
            this.showSearchBox = true;
            var searchPageView = new SearchPageView({q: query});
            this.show(searchPageView, this.options);
            //$(this.el).html(searchPageView.render().el);
            var PageLayout = $('.search-page-view').layout();
            $(this.el).addClass('fill');
            _.extend(window, {PageLayout: PageLayout});
            return this;
        },
        showLoginPage: function () {
            var loginPageView = new LoginPageView();
            $(this.el).addClass('fill');
             $(this.el).html(loginPageView.el);
            //this.show(loginPageView);
        },
        show: function (view, options) {

            // Every page view in the router should need a header.
            // Instead of creating a base parent view, just assign the view to this
            // so we can create it if it doesn't yet exist
            if (!this.headerView) {
                if(view)
                var headerViewModel = new Backbone.Model({showSearch: false});
                if (this.showSearchBox && this.showSearchBox === true) {
                    headerViewModel.set('showSearch', true);
                }
                this.headerView = new HeaderView({model: headerViewModel});
                $('#header').html(this.headerView.el);
            }

            // Close and unbind any existing page view
            if (this.currentView && _.isFunction(this.currentView.close))
                this.currentView.close();

            // Establish the requested view into scope
            this.currentView = view;

            // Need to be authenticated before rendering view.
            // For cases like a user's settings page where we need to double check against the server.
            if (typeof options !== 'undefined' && options.requiresAuth) {
                var self = this;
                settings.session.checkAuth({
                    success: function (res) {
                        // If auth successful, render inside the page wrapper
                        $(self.el).html(self.currentView.render().$el);
                    }, error: function (res) {
                        self.navigate("/", {trigger: true, replace: true});
                    }
                });

            } else {
                // Render inside the page wrapper
                $(this.el).html(this.currentView.render().$el);
                //this.currentView.delegateEvents(this.currentView.events);        // Re-delegate events (unbound when closed)
            }

        },
        default: function (actions) {
            $(this.el).html("This route is not hanled.. you tried to access: " + actions);

        },
        index: function () {
            // Fix for non-pushState routing (IE9 and below)
            var hasPushState = !!(window.history && history.pushState);
            if (!hasPushState)
                this.navigate(window.location.pathname.substring(1), {trigger: true, replace: true});
            else
                if(sessionModel.get('logged_in') === true){
                    this.navigate("/main", {trigger: true, replace: true});
                    return false;
                }
                this.show(new LoginPageView({}));
        }

    });

    return AppRouter;
});
