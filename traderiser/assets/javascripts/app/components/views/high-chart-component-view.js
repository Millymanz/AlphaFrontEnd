/**
 * Created with IntelliJ IDEA.
 * User: RDAsante
 * Date: 10/09/15
 * Time: 16:52
 * To change this template use File | Settings | File Templates.
 */

define(['../../views/abstract-view',
    'templates',
    'highstock', 'highstock-ext'], function (AbstractView, Templates, highcharts) {
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
        events: {
            'change .highlighted': '_changeHighLight'
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

            //$(this.el).attr({'width': '100%', 'height': '100%', 'margin': '0 auto'});
            var self = this;
            $('.highlighted-' + this.model.cid).on("change", function (evt) {
                self.$el.highcharts().highlighted = $(this).prop('checked');
                self.$el.highcharts().redraw();
            });

        },
        _changeHighLight: function (evt) {
            this.$el.highcharts().pointFormat = '<span style="color:{series.color};white-space:nowrap"> \u25CF{series.name}: <b>{point.y}</b></span>';

            this.$el.highcharts().tooltip.positioner = function () {
                return {
                    x: 20,
                    y: 80
                };
            }
            this.$el.highcharts().highlighted = $(evt.target).prop('checked');
            this.$el.highcharts().redraw();
        },
        _resizeChart: function (pane, paneEL) {
            var self = this;
            setTimeout(function () {
                // resizeEnd call function with pass context body
                $(window).resize();
            }, 1000);
        },
        initializeHighCharts: function () {
            
            
            
            var highChartsOptions = $.extend(true, {
                //series: this.collection.toHighChartsData(),
                chart: {
                    events: this.getHighChartsEvents(),
                    margin: 0,
                    style: {
           fontFamily: 'Open sans',
           color: '#333'
       }
                    
                },
                credits: {
                        enabled: false
                    },
            }, this.model.toJSON());

            if (this.stockChart) {
                this.$el.highcharts('StockChart', highChartsOptions);
            } else {
                this.$el.highcharts(highChartsOptions);
            }

        },
        render: function () {
            $('<div class="highlight-chart-' + this.model.cid + '">Highlight:<input type="checkbox" class="highlighted"></div> ').prependTo(this.$el);
            this.$el.highcharts().highlighted = true;
            this.$el.highcharts().redraw();

            return this;
        },
        afterRender: function () {
            setTimeout(function () {
                // resizeEnd call function with pass context body
                $(window).resize();
                //    self.$el.highcharts().resize();
            }, 1000);
//            if (this.widgets && this.widgets !== "") {
//                this.$el.append(this.widgets.get(0));
//            }
            return this;
        },
        bindHighChartsEvents: function () {
            this.listenTo(this.collection, 'add', this.onAddSerie);
            this.listenTo(this.collection, 'remove', this.onRemoveSerie);
            this.listenTo(this.collection, 'reset', this.render);

            if (this.collection && this.collection.length > 0)
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
        }
    });

    return HighChartComponentView;

});