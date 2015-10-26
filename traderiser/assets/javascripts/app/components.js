/**
 * Created with IntelliJ IDEA.
 * User: RDAsante
 * Date: 26/10/15
 * Time: 10:25
 * To change this template use File | Settings | File Templates.
 */

define(['./components/models/highcharts-model',
	'./components/views/high-chart-component-view',
	'./components/models/tabs-component-model',
	'./components/views/tabbed-component-view',
	'./components/views/accordion-component-view'], function(HighChartComponentModel, HighChartComponentView, TabsComponentModel, TabsComponentView, AccordionComponentView) {

	'use strict';
	var components = {
		HighChartComponent: {
			view: HighChartComponentView,
			model: HighChartComponentModel
		},
		TabsComponent: {
			view: TabsComponentView,
			model: TabsComponentModel
		},
		AccordionComponent: {
			view: AccordionComponentView,
			model: ''
		}
	};

	return components;
});