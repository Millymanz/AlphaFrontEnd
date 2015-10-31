/**
 * Created with IntelliJ IDEA.
 * User: RDAsante
 * Date: 10/09/15
 * Time: 16:52
 * To change this template use File | Settings | File Templates.
 */

define(['../../views/abstract-view',
    'templates',
    '../../collections/serie-collection',
    'highstock',
    'highstock-ext',
    'drawer'], function (AbstractView, Templates, SeriesCollection, highcharts) {

    'use strict';


    var ChartToolBar = AbstractView.extend('ChartToolBar', {
        events: {
            'change .highlighted': '_changeHighLight'
        },
        initialize: function (options) {
            options = options || {};
            this.constructor.__super__.initialize.apply(this, arguments);
            this.listenTo(this.collection, 'add', this._addNew);

        },
        render: function () {
            $(this.el).html($('<ul></ul>').addClass('toolbar-menu-ul'));
            return this;
        },
        afterRender: function () {
            var self = this;
            if (this.collection instanceof Array) {
                this.collection = new Backbone.Collection(this.collection);
            }

            if (this.collection.models.length > 0) {

                _.each(this.collection.models, function (model) {
                    var view = model.get('view');
                    self.$el.find('.toolbar-menu-ul').append($('<li></li>').html(view));
                })

                $(self.el).addClass("has-items");
            } else {
                $(self.el).removeClass("has-items");
            }

        },
        /**
         * Add new menu item
         * @param model
         * @private
         */
        _addNew: function (model) {
            var view = model.get('view');
            this.$el.find('.toolbar-menu-ul').append($('<li></li>').html(view));
            return false;
        }
    });



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


            if (typeof PageLayout !== 'undefined') {
                PageLayout.options.center.onresize = _.bind(this._resizeChart, this);
            }

            var self = this;
            $(document).on('change', '.highlight-chart-' + this.model.cid, _.bind(function (evt) {
                console.log('changed => ' + evt);
                self.$el.highcharts().highlighted = $(evt.target).prop('checked');
                self.$el.highcharts().redraw();
            }));


            $(document).on('click', '.toggleShowWidget-' + this.model.cid, _.bind(function (evt) {
                console.log("show and hide");
//			self.$el.addClass("has-inner-drawer");
//		var drawerHeader = $('<div class="drawer-heading"><h2 class="drawer-title">Menu</h2></div>');
//		var drawerFooter = $('<div class="drawer-footer">Close X </div>');
//		var drawerBody = $('<div class="drawer-body"></div>').html(self.widgetContent.show());
//
//		var drawer = 	$('<div class="drawer drawer-inside dw-xs-5 fold"></div>')
//							.html(drawerHeader).append(drawerBody).append(drawerFooter);
//		drawer.prependTo(self.$el);
//		$(drawer).drawer("show");
                return false;
            }));

            //create a toolbar 
            this.toolBarCollection = new Backbone.Collection();
            this.chartToolBar = new ChartToolBar({collection: this.toolBarCollection});

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
                // resizeEnd call function with pass context body height
                //$(window).resize();
                self.$el.highcharts().redraw();
                self.$el.highcharts().setSize(
                        $(self.$el.parent()).width(),
                        $(self.$el.parent()).height(),
                        false
                        );

            }, 1000);
        },
        initializeHighCharts: function () {

            var chartDefaultOptions = {
                chart: {
                    events: this.getHighChartsEvents(),
                    margin: 0,
///					width: '560',
                    //height: 'auto',
                    style: {
                        fontFamily: 'Open sans',
                        color: '#333',
                        padding: '5px'
                    }

                },
                credits: {
                    enabled: false
                }
            }
            if (this.collection instanceof Array) {
                this.collection = new SeriesCollection(this.collection);
                chartDefaultOptions.series = this.collection.toHighChartsData()
            }

            var highChartsOptions = $.extend(true, chartDefaultOptions, this.model.toJSON());
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
        afterRender: function () {

            //show highlights
            if (this.getViewOption('showHighLighted')) {

                var toolbarMenuView = $('<div class="highlight-chart"><i class="fa fa-map-marker"></i> show highlights <input type="checkbox"  checked="checked" class="highlight-chart-' + this.model.cid + '"></div> ');
                this.toolBarCollection.add(new Backbone.Model({view: toolbarMenuView}));
                this.$el.highcharts().highlighted = true;
            }
            //show widgets
            if (this.getViewOption('widgets') && this.getViewOption('widgets') !== "") {
                //build the tool-bar to show widgets
                var widgetMenuView = $('<button>').addClass("btn btn-xs btn-link toggleShowWidget-" + this.model.cid).html('<span class="showHideIcon"><i class="fa fa-newspaper-o"></i> Technical Analysis</span>');
                this.toolBarCollection.add(new Backbone.Model({view: widgetMenuView}));
                this.widgetContent = $(this.getViewOption('widgets').get(0)).hide();
                $('body').append(this.widgetContent);
            }

            $(this.chartToolBar.render().el).prependTo(this.$el);

            setTimeout(function () {
                // resizeEnd call function with pass context body
                $(window).resize();
            }, 5000);

            //this._resizeChart();

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