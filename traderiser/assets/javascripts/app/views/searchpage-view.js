/* 
 *  Software Copyright Gyedi PLC 2015. All Rights Reserved.
 * GYEDI, HASHTAGCAMPAIGN.org are trademarks of GYEDI PLC, LONDON
 * plc and may be registered in certain jurisdictions.
 */
define(['./abstract-view',
    '../components/views/accordion-component-view',
    '../collections/serie-collection',
    'templates',
    '../components/views/high-chart-component-view',
    '../models/search-page-model',
    '../components/models/highcharts-model',
    '../controller/traderiser-chart-controller',
    '../components/views/tabbed-component-view',
    './search-results-view',
    './following-results-list-view',
    './favourites-list-view',
    './continues-results-list-view',
    'jquery-layout',
    'jquery-ui'], function (AbstractView,
        AccordionComponentView,
        SerieCollection,
        templates,
        HighChartComponentView,
        SearchPageModel,
        HighChartsModel,
        TradeRiserComponent,
        TabbedComponentView, 
        SearchResultsView, FollowingResultsListView, FavouritesListView, ContinuesResultsListView) {
    'use strict';

    var SearchPageView = AbstractView.extend('SearchPageView', {
        model: new SearchPageModel(),
        template: 'search-page-template',
        controller: new TradeRiserComponent(),
        events: {
        },
        initialize: function (options) {
            options = options || {};
            this.constructor.__super__.initialize.apply(this, arguments);
            if (options.q !== "") {
                this.question = options.q;
            }
            //this.render();
            //this.showGraph();
            this._makeNewSearch(this.question);
            this.listenTo(sessionModel.getApplicationWrapperModel(), 'change:searchTermText', this._makeNewSearch);
        },
        render: function () {
            var self = this;
            templates.render(this.template, {}, function (error, output) {
                $(self.el).html(output);
            });

            return this;
        },
        afterRender: function () {

            this.accordionWestSideCollection = new Backbone.Collection();
            this.accordionWestSideCollection.add(new Backbone.Model({label: 'accordion one', view: '<p>1. a some more content<p>'}));
//            accordionCollection.add(new Backbone.Model({label: 'accordion two', view: '<p>2. some more content<p>'}));
//            accordionCollection.add(new Backbone.Model({label: 'accordion three', view: '<p>3. some more content<p>'}));
            var accordionComponentView = new AccordionComponentView({model: new Backbone.Model({style: 'simple', title: 'latest information'}), collection: this.accordionWestSideCollection});


            this.westPane = $(this.el).find('#west-content');
            this.centerPane = $(this.el).find('#center-content');
            this.eastPane = $(this.el).find('#east-content');
            
            this.leftSideTabsCollection = new Backbone.Collection();
            var leftSideTabsView = new TabbedComponentView({collection: this.leftSideTabsCollection, model: new Backbone.Model()});
            $(this.westPane).html(leftSideTabsView.render().el);
            $(this.eastPane).html(accordionComponentView.render().el);
//            accordionComponentView.refresh();

        },
        getSearchAnswer: function () {
            sessionModel.getApplicationWrapperModel().getAnswer(this.question);

        },
        /**
         * Show Chart visualisation
         * @returns {*}
         */
        showGraph: function () {
            var self = this;
            this.model.getAllContinousResults().then(function (data) {
                //console.log(data);
                var rawData = sessionModel.getApplicationWrapperModel().getAllContinousResultsCards(data);
                //console.log(rawData);
            }).done(function (data) {

                self.centerPane.html("<p class='alert alert-info'>Nothing to display</p>");
            });
        },
        /**
         * make a new search for a text
         * @param value
         * @private
         */
        _makeNewSearch: function (value) {
            var self = this;
            return this.model.getAnswer(this.question).then(function (data) {
                //console.log(data);
                
                if(_.isNull(data)){
                    self.centerPane.html('<div class="empty-results"><span class="glyphicon glyphicon-asterisk"></span> No results found...try another query</div>');
                    self.eastPane.empty();
                    self.westPane.empty();
                    PageLayout.hide('west');
                    PageLayout.hide('east');
                    
                    return;
                }
                
                
                var resultsCollection = '';
                if (data.ResultSummaries.length > 0) {
                    console.log(data.ResultSummaries);
                    var searchResultsCollection = new Backbone.Collection(data.ResultSummaries);
                    var resultsCardList = new SearchResultsView({collection: searchResultsCollection});
                    //collection.add(new Backbone.Model({label: 'Search Results', content: resultsCardList, active: true}));
                    //self.eastSide.html(resultsCardList.render().el);
                    self.leftSideTabsCollection.add(new Backbone.Model({content: resultsCardList, label: 'Results', active: true}));
                    self.updateOtherResults();
                 }

                var chart = self.controller.displayResults(data);
                if (chart && chart.charts.length > 0) {
                    self.centerPane.empty();

                    if (chart.charts.length > 1) {
                        self.displayChartWithTabs(chart.charts);
                    } else {
                        self.displaySingleChart(chart.charts[0]);
                    }
                    //add other information
                    //self.centerPane.append(chart.perfomanceloadStats);
                    //self.centerPane.append(chart.copyrightStatement);
                } else {
                    toastr.error("Nothing found");
                }
            });

        },
        /**
         * Show single chart with no tabs
         * @param chartInfo
         */
        displaySingleChart: function (chartInfo) {
            var self = this;
            var stockChart = new HighChartComponentView({
                stockChart: true,
                model: new Backbone.Model(chartInfo.chartData),
                collection: [],
                widgets: chartInfo.chartSubWidgets,
                showHighLighted: chartInfo.showHighLightSelection
            });
            self.centerPane.html($(stockChart.render().el));
        },
        /**
         * Display tabs with Chart
         * @param Array charts
         */
        displayChartWithTabs: function (charts) {

            var collection = new Backbone.Collection();
            //create new tabs
            this.tabsComponent = new TabbedComponentView({collection: collection, model: new Backbone.Model({style: 'tabs-right'})});
            this.centerPane.html(this.tabsComponent.render().el);
            _.each(charts, function (chartInfo, i) {
                var first = false;
                if (i === 0) {
                    first = true;
                }
                var chartvalue = i + 1;
                var stockChartView = new HighChartComponentView({
                    stockChart: true,
                    model: new Backbone.Model(chartInfo.chartData),
                    collection: [],
                    widgets: chartInfo.chartSubWidgets,
                    showHighLighted: chartInfo.showHighLightSelection
                });
                collection.add(new Backbone.Model({label: '<i class="fa fa-line-chart"></i> ' + ' Chart' + chartvalue, content: stockChartView, active: first}));

            });
        },
        updateOtherResults: function(){
            var userInfo = sessionModel.getUser();
            
            //first 5 results , maybe put this in config file
            var historicQueries = _.first(_.uniq(userInfo.get('historicQueries')), 5);
            var followingQueries = _.first(_.uniq(userInfo.get('following')), 5);
            var savedQueries = _.first(_.uniq(userInfo.get('savedQueries')), 20);
                        
           var queriesSubscriptionCollection = new Backbone.Collection(followingQueries);
           var historicQueriesCollection = new Backbone.Collection(historicQueries);
           var savedQueriesCollection = new Backbone.Collection(savedQueries);
           //create queriesListView to take a collection of queryModels
           
           var savedQueriesView = new FavouritesListView({collection: savedQueriesCollection});
						var followingQueries = new FollowingResultsListView({collection: queriesSubscriptionCollection});
           //show unique queries
           this.leftSideTabsCollection.add(new Backbone.Model({content: savedQueriesView, label: 'Saved Queries', active: false}));
					this.accordionWestSideCollection.add(new Backbone.Model({view: followingQueries}))
                          
        }
    });

    return SearchPageView;
});

