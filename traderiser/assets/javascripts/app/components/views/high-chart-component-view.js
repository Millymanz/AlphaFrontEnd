/**
 * Created with IntelliJ IDEA.
 * User: RDAsante
 * Date: 10/09/15
 * Time: 16:52
 * To change this template use File | Settings | File Templates.
 */

define(['../../views/abstract-view',
    'templates', 
    'highstock'], function (AbstractView, Templates, highcharts) {
    'use strict';

    var HighChartComponentView = AbstractView.extend('HighChartComponentView', {
        template: false,
        highChartsEvents: {},
        getHighChartsEvents: function () {
            return _.reduce(this.highChartsEvents, function (res, callback, event) {
                res[event] = _.bind(this[callback], this);
                return res;
            }, {}, this);
        },
        initialize: function (options) {
            options = options || {};
            this.constructor.__super__.initialize.apply(this, arguments);
            this.$el.empty();
            this.stockChart = options.stockChart || false;
            this.initializeHighCharts();
            this.bindHighChartsEvents();

            this.render();
            
            PageLayout.options.center.onresize = _.bind(this._resizeChart, this);
            
            //$(this.el).attr({'width': '100%', 'height': '100%', 'position' : 'absolute'});
        },
        _resizeChart: function(pane, paneEL){
           var self = this;
           if (this.resizeTO) clearTimeout(this.resizeTO);
        this.resizeTO = setTimeout(function () {
            // resizeEnd call function with pass context body
                self.adjustChart(self.$el);
            //    self.$el.highcharts().resize();
        }, 500);
        },
        initializeHighCharts: function () {
            var highChartsOptions = $.extend(true, {
                series: this.collection.toHighChartsData(),
                chart: {
                    events: this.getHighChartsEvents()
                }
            }, this.model.toJSON());

            if (this.stockChart) {
                this.$el.highcharts('StockChart', highChartsOptions);
            } else {
                this.$el.highcharts(highChartsOptions);
            }
        },
        render: function () {
            this.$el.highcharts().redraw();
            return this;
        },
        bindHighChartsEvents: function () {
            this.listenTo(this.collection, 'add', this.onAddSerie);
            this.listenTo(this.collection, 'remove', this.onRemoveSerie);
            this.listenTo(this.collection, 'reset', this.render);

            this.collection.each(this.bindHighChartsSerieEvents, this);
        },
        bindHighChartsSerieEvents: function (serie) {
            this.listenTo(serie, 'change', this.onSerieChange);
            this.listenTo(serie, 'add:point', this.onSerieAddPoint);
        },
        unbindHighChartsSerieEvents: function (serie) {
            this.stopListening(serie);
        },
        onSerieAddPoint: function (model, pt) {
            var serie = _.find(this.$el.highcharts().series, function (serie) {
                return serie.options.id === model.highChartsId;
            });
            serie.addPoint(pt);
        },
        onSerieChange: function (model) {
            var changes = model.changed,
                    nbChanges = _.keys(changes).length,
                    serie = _.find(this.$el.highcharts().series, function (serie) {
                        return serie.options.id === model.highChartsId;
                    });

            if (nbChanges === 1 && changes.data) {
                serie.setData(model.get('data'));
            } else if (nbChanges === 1 && changes.visible) {
                serie.setVisible(model.get('visible'));
            } else if (nbChanges === 2 && changes.visible && changes.data) {
                serie.setData(model.get('data'));
                serie.setVisible(model.get('visible'));
            } else {
                serie.update(changes);
            }
        },
        onAddSerie: function (model) {
            this.$el.highcharts().addSeries(model.toJSON(), {id: model.id || model.cid});
            this.bindHighChartsSerieEvents(model);
        },
        onRemoveSerie: function (model) {
            _.find(this.$el.highcharts().series, function (serie) {
                return serie.options.id === model.highChartsId;
            }).remove();
            this.unbindHighChartsSerieEvents(model);
        },
        onBeforeDestroy: function () {
            this.$el.highcharts().destroy();
        },
        adjustChart: function(chart){
            try {
            if (typeof (chart === 'undefined' || chart === null) && this instanceof jQuery) { // if no obj chart and the context is set
               
                this.find('.highcharts-container:visible').each(function () { // for only visible charts container in the curent context
                    $container = $(this); // context container
                    $container.find('div[id^="chart-"]').each(function () { // for only chart
                        $chart = $(this).highcharts(); // cast from JQuery to highcharts obj
                        $chart.setSize($container.width(), $chart.chartHeight, doAnimation = true); // adjust chart size with animation transition
                    });
                });
            } else {
                chart.setSize($('.highcharts:visible').width(), chart.chartHeight, doAnimation = true); // if chart is set, adjust
            }
        } catch (err) {
            // do nothing
        }
            
        }
    });

    return HighChartComponentView;

});