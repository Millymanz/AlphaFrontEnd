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
    'jquery-layout',
    'jquery-ui'], function (
        AbstractView,
        AccordionComponentView,
        SerieCollection,
        templates,
        HighChartComponentView,
        SearchPageModel,
        HighChartsModel,
				TradeRiserComponent) {
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
            this.render();
            this.showGraph();
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

            var accordionCollection = new Backbone.Collection();
            accordionCollection.add(new Backbone.Model({label: 'accordion one', view: '<p>1. a some more content<p>'}));
            accordionCollection.add(new Backbone.Model({label: 'accordion two', view: '<p>2. some more content<p>'}));
            accordionCollection.add(new Backbone.Model({label: 'accordion three', view: '<p>3. some more content<p>'}));


            var accordionComponentView = new AccordionComponentView({model: new Backbone.Model({style: 'simple', title: 'latest information'}), collection: accordionCollection});

            this.eastSide = $(this.el).find('#west-content');
            this.centerPane = $(this.el).find('#center-content');
            this.westPane = $(this.el).find('#east-content');

            $(this.eastSide).html(accordionComponentView.el);
            accordionComponentView.refresh();

        },
        getSearchAnswer: function(){
            sessionModel.getApplicationWrapperModel().getAnswer(this.question);
            
        },
        /**
         * Show Chart visulaisation
         * @returns {*}
         */
        showGraph: function () {
            var self = this;
            this.model.getAllContinousResults().then(function (data) {
                //console.log(data);
                var rawData = sessionModel.getApplicationWrapperModel().getAllContinousResultsCards(data);
                //console.log(rawData);
            }).done(function (data) {
                var highChartOptions = new HighChartsModel({

										colors: ['#2f7ed8', '#0d233a', '#8bbc21', '#910000', '#1aadce', '#492970',
											'#f28f43', '#77a1e5', '#c42525', '#a6c96a'],
										chart: {
											backgroundColor: '#fff',
											borderWidth: 0,
											plotBackgroundColor: '#fff',
											plotShadow: false,
											plotBorderWidth: 0,
											position: 'absolute'
										},
                    title: {
                        text: 'Monthly Average Temperature',
                        x: -20, //center,
												font: 'bold 16px "Trebuchet MS", Verdana, sans-serif'
                    },
                    subtitle: {
                        text: 'Source: WorldClimate.com',
                        x: -20,
												font: 'bold 12px "Trebuchet MS", Verdana, sans-serif'
                    },
                    xAxis: {
                        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
                    },
                    yAxis: {
                        title: {
                            text: 'Temperature (°C)'
                        },
                        plotLines: [{
                                value: 0,
                                width: 1,
                                color: '#808080'
                            }]
                    },
                    tooltip: {
                        valueSuffix: '°C'
                    },
                    legend: {
                        layout: 'vertical',
                        align: 'right',
                        verticalAlign: 'middle',
                        borderWidth: 0,
											itemStyle: {
												font: '9pt Trebuchet MS, Verdana, sans-serif',
												color: 'black'
											},
											itemHoverStyle:{
												color: 'gray'
											}
										}

                });


                var chartCollection = new SerieCollection(
                        [{
                                name: 'Tokyo',
                                data: [7.0, 6.9, 9.5, 14.5, 18.2, 21.5, 25.2, 26.5, 23.3, 18.3, 13.9, 9.6]
                            }, {
                                name: 'New York',
                                data: [-0.2, 0.8, 5.7, 11.3, 17.0, 22.0, 24.8, 24.1, 20.1, 14.1, 8.6, 2.5]
                            }, {
                                name: 'Berlin',
                                data: [-0.9, 0.6, 3.5, 8.4, 13.5, 17.0, 18.6, 17.9, 14.3, 9.0, 3.9, 1.0]
                            }, {
                                name: 'London',
                                data: [3.9, 4.2, 5.7, 8.5, 11.9, 15.2, 17.0, 16.6, 14.2, 10.3, 6.6, 4.8]
                            }]);

                var hightchartcomponentview = new HighChartComponentView({
                    stockChart: true,
                    model: highChartOptions,
                    collection: chartCollection
                });
                self.centerPane.html(hightchartcomponentview.el)
            });
        },
			/**
			 * make a new search for
			 * @param value
			 * @private
			 */
				_makeNewSearch: function(value){
				var self = this;
				return this.model.getAnswer(value).then(function(data){
					//console.log(data);
					 self.controller.displayResults(data);
				});

			}
    });

    return SearchPageView;
});

