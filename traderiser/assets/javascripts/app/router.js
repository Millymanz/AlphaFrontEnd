define([
	'./views/homepage-view',
	'./views/header-view',
	'./views/searchpage-view',
	'./views/login-view'
], function(HomePageView, HeaderView, SearchPageView, LoginPageView) {

	'use strict';

	var AppRouter = Backbone.Router.extend({
		el: $('#app-container'),
		execute: function(callback, args, name) {
			if (name != 'showLoginPage') {
				//check loggion
				if (sessionModel.get('logged_in') == true || $.cookie('logged_in') == "true") {
					this.showSearchBox = true;
					if (callback) callback.apply(this, args);
				} else {
					this.showSearchBox = false;
					this.navigate("/", {trigger: true, replace: true});
				}
			} else {
				if (callback) callback.apply(this, args);
			}
		},
		routes: {
			'': "showLoginPage",
			'login': "showLoginPage",
			'main': "homepage",
			'show/:id': 'show',
			'search/:query': 'searchPage',
			'*actions': 'default'
		},
		initialize: function() {
			Backbone.history.start();
			this.options = {requiresAuth: true};
			sessionModel.checkAccessCredentials();
		},
		homepage: function() {
			this.showSearchBox = false;
			var homepage = new HomePageView({model: new Backbone.Model});
			var options = {requiresAuth: true};
			this.show(homepage, options);
			return this;
		},
		searchPage: function(query) {
			this.showSearchBox = true;
			this.searchTerm = query;
			var searchPageView = new SearchPageView({q: query});
			var options = {requiresAuth: true};

			this.show(searchPageView, options);
			var PageLayout = $(searchPageView.el).layout({
				west: {
					size: 250,
					pin: true,
					closable: false,
					resizeable: false,
					slidable: false
				}
			});
			$(this.el).addClass('fill');
			_.extend(window, {PageLayout: PageLayout});
			return this;
		},
		showLoginPage: function() {
			if (sessionModel.get('logged_in') === true || $.cookie('logged_in') === "true") {
				this.navigate("/main", {trigger: true, replace: true});
				return false;
			}
			var loginPageView = new LoginPageView();
			$(this.el).addClass('fill');
			$(this.el).html(loginPageView.el);
			//this.show(loginPageView);
		},
		show: function(view, options) {

			// Every page view in the router should need a header.
			// Instead of creating a base parent view, just assign the view to this
			// so we can create it if it doesn't yet exist
			if (!this.headerView) {
				if (view)
					var headerViewModel = new Backbone.Model({showSearch: this.showSearchBox, searchTermText: this.searchTerm});
				this.headerView = new HeaderView({model: headerViewModel});
				$('#header').html(this.headerView.el);
			} else {
				this.headerView.model.set('showSearch', this.showSearchBox);
				this.headerView.model.set('searchTermText', this.searchTerm);
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
				var userProfilePromise = sessionModel.getUser().getUserProfile();
				userProfilePromise.then(function(data) {
					//send the user data to the view to be used.
					self.currentView.model.set('userProfileData', data);
				});
				$(this.el).html(this.currentView.render().$el);
			} else {
				// Render inside the page wrapper
				$(this.el).html(this.currentView.render().$el);
				//this.currentView.delegateEvents(this.currentView.events);        // Re-delegate events (unbound when closed)
			}

		},
		default: function(actions) {
			$(this.el).html("This route is not hanled.. you tried to access: " + actions);

		},
		index: function() {
			// Fix for non-pushState routing (IE9 and below)
			var hasPushState = !!(window.history && history.pushState);
			if (!hasPushState)
				this.navigate(window.location.pathname.substring(1), {trigger: true, replace: true});
			else if (sessionModel.get('logged_in') == true) {
				this.navigate("/main", {trigger: true, replace: true});
				return false;
			}
			this.show(new LoginPageView({}));
		}

	});

	return AppRouter;
});
