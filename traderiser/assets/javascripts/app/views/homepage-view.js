define([
    '../controller/application-wrapper-controller',
    './abstract-view',
    'templates',
    './search-box-view',
    '../components/views/tabbed-component-view',
    '../components/models/tabs-component-model',
    './queries-list-view',
    './following-results-list-view',
    'parsley'], function (
            ApplicationWrapperController, 
            AbtractView, 
            templates, 
            SearchBoxView, 
            TabsComponentView, 
            TabsComponentModel,
            QueriesListView,
                    FollowingResultsListView) {
    'use strict';
    var ENTER_KEY = 13;
    var HomepageView = AbtractView.extend('HomepageView', {
        defaults: {
        },
        events: {
            "keydown": "keyAction",
        },
        template: 'homepage-layout',
        initialize: function (options) {
            options = options || {};
            this.constructor.__super__.initialize.apply(this, arguments);
            
            this.searchBoxView = options.searchBoxView || new SearchBoxView();
            this.applicationWrapperController = new ApplicationWrapperController();
            this.listenTo(this.model,'change:userProfileData', this._showUserData);
        },
        render: function () {
            var self = this;
            templates.render(this.template, {}, function (error, output) {
                $(self.el).html(output);
            });
            return this;
        },
        afterRender:function(){
            var searchId = $(this.el).find('.search-box');
            $(searchId).html(this.searchBoxView.el);
        },
        searchQuestion: function (evt) {
            var searchForm = $('form');
            if (searchForm.parsley().validate()) {
                //searchForm.submit();
                var searchText = searchForm.find('input');
                appRouter.navigate("search/" + escape(searchText.val()), {trigger: true, replace: true});
            }

        },
        keyAction: function (e) {
            if (e.which === ENTER_KEY) {
                this.searchQuestion(e);
            }
        },
        _showUserData: function(rawdata){
            var self = this;
            var searchHistoryEl =  this.searchBoxView.getSearchHistoryEL();
            var userInfo = sessionModel.getUser();
            
            //first 5 results , maybe put this in config file
            var historicQueries = _.first(_.uniq(userInfo.get('historicQueries')), 5);
            var followingQueries = _.first(_.uniq(userInfo.get('following')), 5);
                        
           var queriesSubscriptionCollection = new Backbone.Collection(followingQueries);
           var historicQueriesCollection = new Backbone.Collection(historicQueries);
           //create queriesListView to take a collection of queryModels
           
           //show unique queries
            
            var historicQueryListView = new QueriesListView({collection: historicQueriesCollection});
           var queriesSubscriptionListView = new QueriesListView({collection: queriesSubscriptionCollection});
           historicQueryListView.on('query-clicked', _.bind(function(model){
//update searchbox view with value              
               
               self.searchBoxView.trigger('insert-input-value', model.get('Query'));
               return false;
           }));
           $(searchHistoryEl).html(historicQueryListView.render().el);
           
           
        },
        showUserQueriesTab: function(options){
//            var collection = new Backbone.Collection();
//            
//            var tabsComponent = new TabsComponentView({collection : collection, model: new TabsComponentModel({style: 'tabs-right'})});
//            $(this.el).append(tabsComponent.render().el);
//            
//            collection.add(new Backbone.Model({label: 'historicQuery', content: options.tab1, active: true}));
//            collection.add(new Backbone.Model({label: 'Following', content: options.tab2}));
            
        }
        
    });

    return HomepageView;
});