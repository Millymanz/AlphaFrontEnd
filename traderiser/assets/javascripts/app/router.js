define(['./views/homepage-view', './views/header-view' ], function(HomePageView, HeaderView){

	'use strict';

	var AppRouter = Backbone.Router.extend({
		el: $('#app-container'),
		routes: {
			"":"homepage",
			'show/:id': 'show',
			'search/:query': 'searchPage',
			'*actions': 'default'
		},

		initialize: function(){
			 var self = this;
             Backbone.history.start();
			 $(this.el).empty();	
             var headerView = new HeaderView();
             $(this.el).append(headerView.render().el);
		},
		homepage: function(){
			var homepage = new HomePageView();
			$(this.el).append(homepage.render().$el);
			//$(this.el).append("Index route has been called..");
		},
		searchPage: function(query){
			$(document.body).append("Search route has been called.. with query equals : " +  query);
		},
		show: function(id){
			$(document.body).append("Show route has been called.. with id equals : "  + id);
		},
		default: function(actions){
			$(document.body).append("This route is not hanled.. you tried to access: "   + actions);	

		}

	});

	return AppRouter;
});