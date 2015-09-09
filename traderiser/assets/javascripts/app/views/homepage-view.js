define([
    '../controller/application-wrapper-controller',
    './abstract-view',
    'templates',
    './search-box-view',
    '../components/views/tabbed-component-view',
    '../components/models/tabs-component-model',
    './queries-list-view',
    'parsley'], function (
            ApplicationWrapperController, 
            AbtractView, 
            templates, 
            SearchBoxView, 
            TabsComponentView, 
            TabsComponentModel,
            QueriesListView) {
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
            
            this.searchBoxView = new SearchBoxView();
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
                appRouter.navigate("search/" + searchText.val(), {trigger: true, replace: true});
            }

        },
        keyAction: function (e) {
            if (e.which === ENTER_KEY) {
                this.searchQuestion(e);
            }
        },
        _showUserData: function(rawdata){
            
            var data = rawdata.get('userProfileData');
           var userProfileConfigCards = this.applicationWrapperController.getUserProfileConfigCards(data);
           var queriesSubscriptionCollection = new Backbone.Collection(userProfileConfigCards.queriesSubscription);
           var historicQueriesCollection = new Backbone.Collection(userProfileConfigCards.historicQueries);
           //create queriesListView to take a collection of queryModels
           var historicQueryListView = new QueriesListView({collection: historicQueriesCollection});
           var queriesSubscriptionListView = new QueriesListView({collection: queriesSubscriptionCollection});
           
           console.log(historicQueryListView.el);
           var options = {
               tab1: historicQueryListView.el,
               tab2: queriesSubscriptionListView.el
           }
           this.showUserQueriesTab(options);
        },
        showUserQueriesTab: function(options){
            var collection = new Backbone.Collection();
            collection.add(new Backbone.Model({label: 'historicQuery', content: options.tab1, active: true}));
            collection.add(new Backbone.Model({label: 'queriesSubscription', content: options.tab2}));
            
            var tabsComponent = new TabsComponentView({collection : collection, model: new TabsComponentModel({style: 'tabs-right'})});
            $(this.el).append(tabsComponent.el);
        }
        
    });

    return HomepageView;
});