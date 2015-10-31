/**
 * Created with IntelliJ IDEA.
 * User: RDAsante
 * Date: 19/10/15
 * Time: 15:43
 * To change this template use File | Settings | File Templates.
 */

define(['../views/abstract-view', 'backbone', '../config/tr-chart-helper', 'highstock'], function (AbstractView, Backbone, chartHelper, highcharts) {


    //Class
    function ResultsData() {
        this.smaOverlay = [];
        this.upperBollingerBand = [];
        this.lowerBollingerBand = [];
        this.rsiData = [];
        this.aroonOsc = [];
        this.aroonUp = [];
        this.aroonDown = [];
        this.MACDHistogram = [];
        this.MACDline = [];
        this.avtrInd = [];
        this.higlighters = [];
    }


    var TradeRiserComponent = Backbone.Model.extend({
        initialize: function () {

        },
        /**
         * RenderResults
         * @param returnedData
         */
        renderQueryResults: function (returnedData) {
            var self = this;
            try {

                var json = returnedData;
                var obj = JSON && JSON.parse(json) || $.parseJSON(json);

                if (obj != "") {
                    if (obj != null || obj != 'undefined') {

                        var assetClassName = obj.ResultSummaries[0].SymbolID;

                        for (var i = 0; i < obj.ResultSummaries.length; i++) {

                            var extraFieldsArray = new Array();

                            var tings = "";
                            var limit = 2;
                            if (obj.ResultSummaries[i].KeyResultField.length <= 2) {
                                limit = obj.ResultSummaries[i].KeyResultField.length;
                            }

                            //for (var n = 0; n < obj.ResultSummaries[i].KeyResultField.length; n++) {
                            for (var n = 0; n < limit; n++) {

                                var str = JSON.stringify(obj.ResultSummaries[i].KeyResultField[n]);
                                var str = str.replace('"', ' ');
                                var resn = str.replace('"', ' ');
                                var resv = resn.replace('}', ' ');
                                var resf = resv.replace('{', ' ');
                                var ress = resf.replace(',', ' ');

                                var tempArray = obj.ResultSummaries[i].KeyResultField[n];

                                var extraFields = [
                                    {
                                        keyfield: tempArray[0] + ' : ', keydata: tempArray[1]
                                    }
                                ];

                                tings = extraFields;

                                extraFieldsArray.push(extraFields);
                            }

                            var resultItem = {
                                SymbolID: obj.ResultSummaries[i].SymbolID,
                                StartDateTime: obj.ResultSummaries[i].StartDateTime,
                                EndDateTime: obj.ResultSummaries[i].EndDateTime,
                                Source: obj.ResultSummaries[i].Source,
                                TimeFrame: obj.ResultSummaries[i].TimeFrame,
                                MoreStandardData: obj.ResultSummaries[i].MoreStandardData,
                                MoreKeyFields: obj.ResultSummaries[i].MoreKeyFields,
                                QueryID: obj.ResultSummaries[i].QueryID,
                                SymbolImages: obj.ResultSummaries[i].ImageCollection,
                                ExtraFields: extraFieldsArray
                            };

                            //self.onDemandResults.push(resultItem);

                            if (i == 0) {
                                self.selectHighlightItem(resultItem.QueryID);
                            }
                        }
                        self.displayResult(obj);
                    }
                }
                else {

                    //var displayError = $("#noresults");

                    var displayError = document.getElementById("noresults");
                    displayError.style.display = 'block';
                    //$(this.el).append($('<div style='width: 200px;'">TradeRiser does not understand your input. Tip-Check your spelling, and use English</div>'));

                    //$(this.el).append($('<div id="noresults">TradeRiser does not understand your input. Tip-Check your spelling, and use English</div>'));
                    // alert('No Results');
                }
            }
            catch (ex) {
                console.log(ex);
            }

        },
        /**
         *
         * @param latestResultCard
         */
        upDateContinousQueryResult: function (latestResultCard) {


            var loadchart = document.getElementById("loadchartDia");
            if (loadchart != null || loadchart != 'defined') {
                loadchart.style.display = 'block';
            }



            //this should be done on the server side
            var imageArray = new Array();
            if (latestResultCard.Source == "Forex") {
                var symItemArr = latestResultCard.SymbolID.split('/');

                for (var q = 0; q < symItemArr.length; q++) {
                    var path = '../../Images/flagcurrencies/' + symItemArr[q] + '.png';
                    imageArray.push(path);
                }
            }
            //-----------------------------------------------//


            var tings = "";
            var extraFieldsArray = new Array();

            for (var n = 0; n < latestResultCard.KeyResultField.length; n++) {
                var str = JSON.stringify(latestResultCard.KeyResultField[n]);
                var str = str.replace('"', ' ');
                var resn = str.replace('"', ' ');
                var resv = resn.replace('}', ' ');
                var resf = resv.replace('{', ' ');
                var ress = resf.replace(',', ' ');
                var tempArray = latestResultCard.KeyResultField[n];

                var extraFields = [{
                        keyfield: tempArray[0] + ' : ', keydata: tempArray[1]
                    }];
                tings = extraFields;
                extraFieldsArray.push(extraFields);
            }

            var resultItem = {
                SymbolID: latestResultCard.SymbolID,
                StartDateTime: latestResultCard.StartDateTime,
                EndDateTime: latestResultCard.EndDateTime,
                Source: latestResultCard.Source,
                TimeFrame: latestResultCard.TimeFrame,
                MoreStandardData: latestResultCard.MoreStandardData,
                MoreKeyFields: latestResultCard.MoreKeyFields,
                QueryID: latestResultCard.QueryID,
                SymbolImages: imageArray,
                ExtraFields: extraFieldsArray


                        /*,
                         ExtraFields: extraFieldsArray*/
            };

            //	self.continuousResults.unshift(resultItem); create a new model for continuesResults

            setTimeout(function () {
                if (loadchart != null || loadchart != 'defined') {
                    loadchart.style.display = 'none';
                }
            }, 3000);

        },
        displayResults: function (obj) {
            var self = this;
            var resultsData = new ResultsData();

            var arraySeries = [];
            var overlayArray = [];
            var trendsOverlayArray = [];
            var highlighterArray = [];
            var yAxisArray = []; //has to be double quotes
            var groupingUnits = [];
            self.resultsCanvas;

            var presentationTypeCount = obj.CurrentResult.PresentationTypes.length;

//			if (presentationTypeCount > 0) {
//				self.resultsCanvas = $('<div class="results-canvas"></div>').append($('<br/>'
//					+ '<table id="tableCanvas" width="100%" cellpadding="15" cellspacing="1" border="1" style="border-color:#E0E0E0;"></table>'));
//
//			}

            var rawDataResults = obj.CurrentResult.RawDataResults;

            var selectChartKey = '';

            var iterRow = 0;
            var iter = 0;

            var mainWidget = {
                charts: []
            };
            //Main widget
            try {
                for (var pp = 0; pp < presentationTypeCount; pp++, iterRow++) {
                    self.resultsCanvas = "";
                    self.resultsCanvas = $('<div class="results-canvas-' + pp + '"></div>').append($('<br/>'
                            + '<table id="tableCanvas" width="100%" cellpadding="15" cellspacing="1" border="1" style="border-color:#E0E0E0;"></table>'));

                    //this.resultsCanvas.find('#tableCanvas').html(""); //lets empty the results canvas as we want a new one for each widget
                    var json = rawDataResults[pp].ChartReadyDataResults;
                    var dataLookUp = self.createLookUp(json);
                    var mulitipleWidgetLookUp = self.createMulitipleWidgetsLookUp(json);
                    var extIndicatorLookUp = self.createExternalIndicatorLookUp(json);


                    switch (obj.CurrentResult.PresentationTypes[pp].MainWidget) {
                        case 'Table':
                            {

                            }
                            break;
                        case 'SideBarChart':
                            {
                                self.widgetPlacerT(pp, presentationTypeCount, 'Statistical Analysis', '500px', 'sideBarChart', iter);


                                var lengthCount = obj.CurrentResult.RawDataResults[pp].ChartReadyDataResults.length;

                                var lineSeriesOptions = [],
                                        symbolNames = [],
                                        chartData = [];
                                var tempSeries = [];

                                var xAxis = "";
                                var yAxis = "";
                                var title = "";

                                for (var bb = 0; bb < obj.CurrentResult.RawDataResults[pp].ChartReadyDataResults.length; bb++) {
                                    for (var ss = 0; ss < obj.CurrentResult.RawDataResults[pp].ChartReadyDataResults[bb].GenericStr.length; ss++) {

                                        for (var cc = 0; cc < obj.CurrentResult.RawDataResults[pp].ChartReadyDataResults[bb].GenericStr[ss].length; cc++) {

                                            if (ss == 0) {
                                                symbolNames.push(obj.CurrentResult.RawDataResults[pp].ChartReadyDataResults[bb].GenericStr[0][cc]);

                                                xAxis = obj.CurrentResult.RawDataResults[pp].ChartReadyDataResults[bb].Xaxis;
                                                yAxis = obj.CurrentResult.RawDataResults[pp].ChartReadyDataResults[bb].Yaxis;
                                                title = obj.CurrentResult.RawDataResults[pp].ChartReadyDataResults[bb].Title;

                                            }
                                            else {
                                                var timeFrameGroupedData = {
                                                    name: obj.CurrentResult.RawDataResults[pp].ChartReadyDataResults[bb].GenericStr[ss][cc],
                                                    data: []
                                                };
                                                tempSeries.push(timeFrameGroupedData);

                                            }
                                        }
                                    }
                                }


                                for (var bb = 0; bb < obj.CurrentResult.RawDataResults[pp].ChartReadyDataResults.length; bb++) {
                                    chartData = [];

                                    for (var ss = 0; ss < obj.CurrentResult.RawDataResults[pp].ChartReadyDataResults[bb].Value.length; ss++) {
                                        chartData = []
                                        for (var vv = 0; vv < obj.CurrentResult.RawDataResults[pp].ChartReadyDataResults[bb].Value[ss].length; vv++) {

                                            chartData.push(obj.CurrentResult.RawDataResults[pp].ChartReadyDataResults[bb].Value[ss][vv]);
                                        }
                                        tempSeries[ss].data = chartData;
                                    }
                                }
                                var chartInfo = {
                                    chartID: _.uniqueId(),
                                    chartData: {
                                        chart: {
                                            type: 'bar'
                                        },
                                        title: {
                                            text: title
                                        },
                                        xAxis: {
                                            categories: symbolNames,
                                            title: {
                                                text: null
                                            }
                                        },
                                        yAxis: {
                                            min: 0,
                                            title: {
                                                text: yAxis,
                                                align: 'high'
                                            },
                                            labels: {
                                                overflow: 'justify'
                                            }
                                        },
                                        tooltip: {
                                            valueSuffix: ' ' + yAxis
                                        },
                                        plotOptions: {
                                            bar: {
                                                dataLabels: {
                                                    enabled: true
                                                }
                                            }
                                        },
                                        legend: {
                                            layout: 'vertical',
                                            align: 'right',
                                            verticalAlign: 'top',
                                            x: -40,
                                            y: 80,
                                            floating: true,
                                            borderWidth: 1,
                                            backgroundColor: ((Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF'),
                                            shadow: true
                                        },
                                        credits: {
                                            enabled: false
                                        },
                                        series: tempSeries
                                    }};
                                self.initalizeSubWidgets(obj.CurrentResult.PresentationTypes[pp], pp, obj, dataLookUp, arraySeries, overlayArray, groupingUnits, yAxisArray, iter, extIndicatorLookUp, mulitipleWidgetLookUp, trendsOverlayArray);

                                chartInfo.chartSubWidgets = this.resultsCanvas;
                                mainWidget.charts.push(chartInfo);
                                //$('.sideBarChart').highcharts();
                            }
                            break;
                        case 'ColumnChart':
                            {
                                self.widgetPlacerT(pp, presentationTypeCount, 'Statistical Analysis', '500px', 'columnChart', iter);

                                var lengthCount = obj.CurrentResult.RawDataResults[pp].ChartReadyDataResults.length;

                                var lineSeriesOptions = [],
                                        symbolNames = [],
                                        chartData = [];

                                var xAxis = "";
                                var yAxis = "";
                                var title = "";


                                for (var bb = 0; bb < obj.CurrentResult.RawDataResults[pp].ChartReadyDataResults.length; bb++) {
                                    //symbolNames.push(obj.CurrentResult.RawDataResults[pp].ChartReadyDataResults[0][bb]);

                                    for (var ss = 0; ss < obj.CurrentResult.RawDataResults[pp].ChartReadyDataResults[bb].GenericStr[0].length; ss++) {
                                        symbolNames.push(obj.CurrentResult.RawDataResults[pp].ChartReadyDataResults[bb].GenericStr[0][ss]);

                                        xAxis = obj.CurrentResult.RawDataResults[pp].ChartReadyDataResults[bb].Xaxis;
                                        yAxis = obj.CurrentResult.RawDataResults[pp].ChartReadyDataResults[bb].Yaxis;
                                        title = obj.CurrentResult.RawDataResults[pp].ChartReadyDataResults[bb].Title;

                                    }


                                }


                                for (var bb = 0; bb < obj.CurrentResult.RawDataResults[pp].ChartReadyDataResults.length; bb++) {
                                    for (var ss = 0; ss < obj.CurrentResult.RawDataResults[pp].ChartReadyDataResults[bb].Value[0].length; ss++) {
                                        chartData.push(obj.CurrentResult.RawDataResults[pp].ChartReadyDataResults[bb].Value[0][ss]);
                                    }
                                }


                                //$('.columnChart').highcharts();
                                self.initalizeSubWidgets(obj.CurrentResult.PresentationTypes[pp], pp, obj, dataLookUp, arraySeries, overlayArray, groupingUnits, yAxisArray, iter, extIndicatorLookUp, mulitipleWidgetLookUp, trendsOverlayArray);

                                var chartInfo = {
                                    chartID: _.uniqueId(),
                                    chartData: {
                                        chart: {
                                            type: 'column'
                                        },
                                        title: {
                                            text: title
                                        },
                                        yAxis: {
                                            title: {
                                                text: yAxis
                                            }

                                        },
                                        xAxis: {
                                            categories: symbolNames
                                                    //categories: ['EURUSD', 'NZDUSD', 'USDCAD', 'GBPUSD', 'AUDUSD', 'USDJPY', 'USDCHF']
                                        },
                                        credits: {
                                            enabled: false
                                        },
                                        series: [
                                            {
                                                colorByPoint: true,
                                                data: chartData,
                                                name: 'Currency'
                                            }
                                        ]
                                    }
                                }
                                chartInfo.chartSubWidgets = this.resultsCanvas;
                                mainWidget.charts.push(chartInfo);
                            }
                            break;

                        case 'LineSeriesChart':
                            {

                                self.widgetPlacerT(pp, presentationTypeCount, 'Correlation Analysis', '500px', 'correlationChart', iter);

                                var lengthCount = obj.CurrentResult.RawDataResults[pp].ChartReadyDataResults.length;

                                var lineSeriesOptions = [],
                                        symbolNames = [];

                                for (var bb = 0; bb < obj.CurrentResult.ResultSymbols[pp].length; bb++) {
                                    symbolNames.push(obj.CurrentResult.ResultSymbols[pp][bb]);
                                }

                                var workingKey = "";

                                for (var c = 0; c < lengthCount; c++) {
                                    var dataKey = "RAW_COMPARISON" + "_" + symbolNames[c];
                                    dataResults = dataLookUp[dataKey];

                                    if (dataResults != null || dataResults !== undefined) {

                                        var lineSeriesData = [];
                                        workingKey = dataKey;

                                        dataLength = dataResults.length;

                                        for (i = 0; i < dataLength; i++) {
                                            lineSeriesData.push([
                                                dataResults[i][0], // the date
                                                dataResults[i][4] // the volume
                                            ])
                                        }

                                        lineSeriesOptions[c] = {
                                            name: symbolNames[c],
                                            data: lineSeriesData
                                        }
                                    }//new
                                }//for loop end


                                //var dateTimeTemp = dataResults[1][0] - dataResults[0][0];

                                if (lineSeriesOptions != null || lineSeriesOptions !== undefined) {

                                    dataResults = dataLookUp[workingKey];

                                    //var dateTimeTemp = lineSeriesOptions[1]["data"][0] - lineSeriesOptions[0]["data"][0];
                                    var dateTimeTemp = dataResults[1][0] - dataResults[0][0];

                                    var bIntradayChart = true;

                                    if (dateTimeTemp >= 86400000) {
                                        bIntradayChart = false;
                                    }

                                    var buttonSetup = {selected: 4};

                                    if (bIntradayChart) {
                                        var buttonsArray = [
                                            {
                                                type: 'hour',
                                                count: 1,
                                                text: '1h'
                                            },
                                            {
                                                type: 'hour',
                                                count: 2,
                                                text: '2h'
                                            },
                                            {
                                                type: 'hour',
                                                count: 3,
                                                text: '3h'
                                            },
                                            {
                                                type: 'day',
                                                count: 1,
                                                text: '1D'
                                            },
                                            {
                                                type: 'all',
                                                count: 1,
                                                text: 'All'
                                            }
                                        ];

                                        buttonSetup = {
                                            buttons: buttonsArray,
                                            selected: 2,
                                            inputEnabled: false
                                        }
                                    }

                                    var chartInfo = {
                                        chartId: _.unique(),
                                        chartData: {
                                            chart: {
                                            },
                                            rangeSelector: buttonSetup,
                                            yAxis: {
                                                labels: {
                                                    formatter: function () {
                                                        return (this.value > 0 ? '+' : '') + this.value + '%';
                                                    }
                                                },
                                                plotLines: [
                                                    {
                                                        value: 0,
                                                        width: 2,
                                                        color: 'silver'
                                                    }
                                                ]
                                            },
                                            plotOptions: {
                                                series: {
                                                    compare: 'percent'
                                                }
                                            },
                                            tooltip: {
                                                pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b> ({point.change}%)<br/>',
                                                valueDecimals: 2
                                            },
                                            series: lineSeriesOptions
                                        }
                                    }
//
//								$('.correlationChart').highcharts('StockChart', {
//
//								});
                                }


                                // }
                                //self.initalizeSubWidgets(obj.CurrentResult.PresentationTypes[pp], pp, obj, dataLookUp, resultsData, iter);
                                self.initalizeSubWidgets(obj.CurrentResult.PresentationTypes[pp], pp, obj, dataLookUp, arraySeries, overlayArray, groupingUnits, yAxisArray, iter, extIndicatorLookUp, mulitipleWidgetLookUp, trendsOverlayArray);

                                chartInfo.chartSubWidgets = this.resultsCanvas;
                                mainWidget.charts.push(chartInfo);

                            }
                            break;

                        case 'CandleStickChart':
                            {
                                arraySeries = []; //test
                                overlayArray = [];
                                highlighterArray = [];
                                yAxisArray = []; //has to be double quotes


                                var chartClassName = 'chartspace dialogchart' + pp;
                                //var markup = "<div class='widgetTitle'>15 Timeframe</div><br/><div class='" + chartClassName + "'style='height: 610px; width:50%'></div>";
                                //function to confirm number of indicators involved
                                var candlestickHeight = '610px';

                                switch (extIndicatorLookUp.length) {
                                    case 2:
                                        {
                                            candlestickHeight = '740px'
                                        }
                                        break;
                                    case 3:
                                        {
                                            candlestickHeight = '920px'
                                        }
                                        break;
                                    case 4:
                                        {
                                            candlestickHeight = '1040px'
                                        }
                                        break;
                                }


                                self.widgetPlacerT(pp, presentationTypeCount, 'Technical Analysis', '610px', chartClassName, iter);

                                var dataResultsT = dataLookUp["RAW"];
                                if (dataResultsT != null || dataResultsT !== undefined) {

                                    var lineSeriesOptions = [],
                                            symbolNames = [];

                                    var ohlc_CandleStick = [], volume_CandleStick = [];

                                    for (var bb = 0; bb < obj.CurrentResult.ResultSymbols[pp].length; bb++) {
                                        symbolNames.push(obj.CurrentResult.ResultSymbols[pp][bb]);
                                    }

                                    var c = 0;
                                    var dataLength = dataResultsT.length;

                                    if (dataLength > 0) {

                                        var dateTimeTemp = dataResultsT[1][0] - dataResultsT[0][0];

                                        var bIntradayChart = true;

                                        if (dateTimeTemp >= 86400000) {
                                            bIntradayChart = false;
                                        }


                                        for (i = 0; i < dataLength; i++) {
                                            ohlc_CandleStick.push([
                                                dataResultsT[i][0], // the date
                                                dataResultsT[i][1], // open
                                                dataResultsT[i][2], // high
                                                dataResultsT[i][3], // low
                                                dataResultsT[i][4] // close
                                            ]);

                                            volume_CandleStick.push([
                                                dataResultsT[i][0], // the date
                                                dataResultsT[i][5] // the volume
                                            ])
                                        }
                                    }


                                    //// set the allowed units for data grouping
                                    var groupingUnits = [
                                        [
                                            'week', // unit name
                                            [1]                             // allowed multiples
                                        ],
                                        [
                                            'month',
                                            [1, 2, 3, 4, 6]
                                        ]
                                    ];


                                    var mainChartItem = {
                                        type: 'candlestick',
                                        name: symbolNames[0],
                                        data: ohlc_CandleStick,
                                        dataGrouping: {
                                            units: groupingUnits
                                        }
                                    }

                                    if (bIntradayChart) {
                                        mainChartItem = {
                                            type: 'candlestick',
                                            name: symbolNames[0],
                                            data: ohlc_CandleStick
                                        }
                                    }
                                    arraySeries.push(mainChartItem);

                                    for (var hl = 0; hl < rawDataResults[pp].HighLightRegion.length; hl++) {

                                        rawDataResults[pp].HighLightRegion[hl].Comment.split("**");
                                        ;


                                        var highlighterItem = {
                                            colour: rawDataResults[pp].HighLightRegion[hl].Colour,
                                            axisIndex: 0,
                                            seriesIndex: 0,
                                            startDate: rawDataResults[pp].HighLightRegion[hl].StartDateTime,
                                            endDate: rawDataResults[pp].HighLightRegion[hl].EndDateTime,
                                            speechBubbleHtml: rawDataResults[pp].HighLightRegion[hl].Comment

                                                    //speechBubbleHtml: '<b>Histogram </b> <br/> other comment '

                                        }
                                        highlighterArray.push(highlighterItem);
                                    }

                                    var chartItemDef = {
                                        title: {
                                            text: 'OHLC'
                                        },
                                        height: 310,
                                        lineWidth: 2
                                    };

                                    yAxisArray.push(chartItemDef);

                                    var presentationTypeIndex = pp;
                                    //self.initalizeSubWidgets(obj.CurrentResult.PresentationTypes[pp], pp, obj, dataLookUp, arraySeries, overlayArray, groupingUnits, yAxisArray, iter);
                                    self.initalizeSubWidgets(obj.CurrentResult.PresentationTypes[pp], pp, obj, dataLookUp, arraySeries, overlayArray, groupingUnits, yAxisArray, iter, extIndicatorLookUp, mulitipleWidgetLookUp, trendsOverlayArray);


                                    var chartSelectInfo = self.selectMiniChart(presentationTypeIndex, obj, highlighterArray, dataLookUp, arraySeries, overlayArray, yAxisArray);
                                    //Insert into Title area
                                    if (highlighterArray.length > 0) {
                                        chartSelectInfo.showHighLightSelection = true;
                                    }
                                    chartSelectInfo.chartSubWidgets = this.resultsCanvas;
                                    mainWidget.charts.push(chartSelectInfo);

                                }

                            }
                            break;
                    }

                    if (iterRow == 2) {
                        iterRow = 0;
                        iter++;
                    }
                }

                //performance stats
                var performanceStats = self.LoadPerformanceStatistics(obj);


                //disclaimer
                var copyRightStatement = $('<div class="copyright"></div>').append($('<br/><br/><div id="riskDisclaimer"><h2>Risk Disclaimer</h2><a class="naviPos" href="#performStatsButton">Top</a><p>Please acknowledge the following: <br/>The Charts are provided'
                        + '" as is", without warranty or guarantee of any kind, including but not limited to the warranties of merchantability and fitness for a particular purpose.'
                        + 'In no event shall TradeRiser Limited and its affiliates or any third party contributor be liable for any claim, damages or other liability, whether in an '
                        + 'action of contract, tort or otherwise, arising from, out of or in connection with the use of or other dealings in the Charts. The Charts run on pricing '
                        + 'data provided by us to a third party charting administrator. You accept that the price data displayed in the Charts may be delayed and that we do not '
                        + 'guarantee the accuracy or completeness of the data and that we do not guarantee that the service will be uninterrupted.</p><p>'
                        + '<h4>Disclaimer</h4>The TradeRiser service includes analysis '
                        + 'of financial instruments. There are potential risks relating to investing and trading. You must be aware of such risks and familiarize yourself in regard '
                        + 'to such risks and to seek independent advice relating thereto. You should not trade with money that you cannot afford to lose. The TradeRiser service and'
                        + 'its content should not be construed as a solicitation to invest and/or trade. You should seek independent advice in this regard. Past performance is not'
                        + 'indicative of future performance. No representation is being made that any results discussed within the service and its related media content will be achieved.'
                        + 'TradeRiser, TradeRiser Limited, their members, shareholders, employees, agents, representatives and resellers do not warrant the completeness, accuracy or timeliness'
                        + 'of the information supplied, and they shall not be liable for any loss or damages, consequential or otherwise, which may arise from the use or reliance of the'
                        + 'TradeRiser service and its content.</p></div>'));


                mainWidget.copyrightStatement = copyRightStatement.get(0);
                mainWidget.perfomanceloadStats = performanceStats.get(0)

                return mainWidget;

            }
            catch (err) {
                alert(err);
            }
        },
        LoadPerformanceStatistics: function (obj) {

            var presentationTypeCount = obj.CurrentResult.PresentationTypes.length;
            var statsDomObject = $('<div class="performance-stats"></div>');

            for (var pp = 0; pp < presentationTypeCount; pp++) {
                if (obj.CurrentResult.RawDataResults[pp].PerformanceStatistics.length > 0) {
                    statsDomObject.append($("<div id='performanceStats'><h2>Performance Statistics</h2><a class='naviPos' href='#performStatsButton'>Top</a>"));
                    //$(this.el).append($("<div class ='performanceStatsNote'>*Below are listed table(s) of performance statistics which predominantly shows the pattern recoginition rate and this tells you how reliable the recognition is for the symbol."
                    //    + "<br/>The percentage value gains more significance and value over time as the number of patterns found increases.</div>"));
                    statsDomObject.append($("<div class ='performanceStatsNote'>" + obj.CurrentResult.RawDataResults[pp].PerformanceStatistics[0].Description + "</div>"));
                    break;
                }
            }


            for (var pp = 0; pp < presentationTypeCount; pp++) {

                //header management
                for (var mm = 0; mm < obj.CurrentResult.RawDataResults[pp].PerformanceStatistics.length; mm++) {

                    var tableId = "performanceStatsTable" + mm;

                    statsDomObject.append($("<table class= 'performanceStatsTable' id = " + tableId + " border='1'><tr></tr></table>"));

                    for (var tt = 0; tt < obj.CurrentResult.RawDataResults[pp].PerformanceStatistics[mm].Headers.length; tt++) {

                        statsDomObject.find('#' + tableId + ' > tbody > tr').append("<td class='performanceStatsHeaderCells' id=pshcelln" + tt + " valign='top'>"
                                + obj.CurrentResult.RawDataResults[pp].PerformanceStatistics[mm].Headers[tt] + "</td>");

                    }


                    //Stats body
                    for (var tt = 0; tt < obj.CurrentResult.RawDataResults[pp].PerformanceStatistics[mm].StatsLog.length; tt++) {

                        var createdTemp = "rown" + tt;
                        var createdId = "id=" + createdTemp;

                        statsDomObject.find('#' + tableId).append("<tr " + createdId + "></tr>");


                        for (var rr = 0; rr < obj.CurrentResult.RawDataResults[pp].PerformanceStatistics[mm].StatsLog[tt].length; rr++) {
                            //$('#' + tableId + ' > tbody > #' + createdTemp)
                            statsDomObject.find('#' + tableId + ' > tbody > #' + createdTemp).append("<td class='performanceStatsCells' id=pscelln" + tt + " valign='top'>"
                                    + obj.CurrentResult.RawDataResults[pp].PerformanceStatistics[mm].StatsLog[tt][rr] + "</td>");
                        }
                    }


                }
            }
            return statsDomObject;
        },
        createMulitipleWidgetsLookUp: function (json) {
            var tempLookUp = {};

            json.forEach(function (el, i, arr) {
                json.forEach(function (nu, j, arrd) {
                    if (el.Key == nu.Key && i != j) {
                        var currentCount = tempLookUp[el.Key];
                        if (typeof currentCount !== 'undefined') {
                            tempLookUp[el.Key] = currentCount + 1;
                        }
                        else {
                            tempLookUp[el.Key] = 1;
                        }
                    }
                });
            });
            return tempLookUp;
        },
        widgetPlacer: function (index, total, markup) {

            var remaining = total - index;
            var remainder = index % 2;

            var nthPos = index;

            var width = '50%';
            if (remaining == 1) {
                width = '100%';
            }
            var appendToTableChild = this.resultsCanvas.find('#tableCanvas tr:nth-child(' + nthPos + ')');

            if (index == 0) {
                if (remaining > 1) {
                    this.resultsCanvas.find('#tableCanvas').append($("<tr><td style='top:0px' width='50%' id=celln" + index + " >" + markup + "</td></tr>"));
                }
                else {
                    this.resultsCanvas.find('#tableCanvas').append($("<tr><td style='top:0px' width='100%' id=celln" + index + " >" + markup + "</td></tr>"));
                }
            }
            else {
                if (remaining > 1) {
                    $("<td style='top:0px' id=celln" + index + " width='100%'>" + markup + "</td>").appendTo(appendToTableChild);
                }
                else {
                    $("<td style='top:0px' id=celln" + index + " width='50%'>" + markup + "</td>").appendTo(appendToTableChild);
                }
            }
        },
        /**
         * Comments needed
         * @param index
         * @param total
         * @param title
         * @param height
         * @param chartClassName
         * @param iter
         */
        widgetPlacerT: function (index, total, title, height, chartClassName, iter) {
            var remaining = total - index;
            var remainder = index % 2;
            var nthPos = 0;
            var width = '100%';
            var markup = "<div class='widgetTitle'>" + title + "</div><br/><br/> <div id='highlightControl" + index + "'></div>" +
                    "<div class='" + chartClassName + "'></div>";

            this.resultsCanvas.find('#tableCanvas').append($("<tr><td colspan='2' style='top:0px' width='100%' id=celln" + index + " valign='top'>" + markup + "</td></tr>"));

        },
        /**
         *
         * @param index
         * @param total
         * @param title
         * @param height
         * @param chartClassName
         * @param iter
         */
        widgetPlacerTSideBySide: function (index, total, title, height, chartClassName, iter) {

            var remaining = total - index;
            var remainder = index % 2;

            // var nthPos = index;
            //var nthPos = iter;

            var nthPos = 0;

            //var width = '50%';
            //if (remaining == 1) {
            //    width = '100%';
            //}

            var width = '100%';
            if (remainder == 0 && remaining > 1) {
                //width = '50%';
                width = '700px';
            }

            //var markup = "<div class='widgetTitle'>" + title + "</div><br/><br/><div class='" + chartClassName + "' style='height: " + height + "'></div>";

            var markup = "<div class='widgetTitle'>" + title + "</div><br/><br/><div class='" + chartClassName + "' style='height: " + height + "; width:" + width + "'></div>"; //*
            // var markup = "<div class='widgetTitle'>" + title + "</div><br/><div class='" + chartClassName + "' style='height: " + height + "; width= 50% '></div>";



            if (remainder == 0) {
                if (remaining > 1) {
                    this.resultsCanvas.find('#tableCanvas').append($("<tr><td style='top:0px' width='50%' id=celln" + index + " valign='top'>" + markup + "</td></tr>"));

                }
                else {
                    this.resultsCanvas.find('#tableCanvas').append($("<tr><td colspan='2' style='top:0px' width='100%' id=celln" + index + " valign='top'>" + markup + "</td></tr>"));
                }
            }
            else {
                // $("#tableCanvas  > tbody > tr > td").eq(nthPos).after("<td style='top:0px' id=celln" + index + " width='100%' valign='top'>" + markup + "</td>");

                var indset = index - 1;
                var newId = "#celln" + indset;

                //$("#tableCanvas  > tbody > tr > " + newId).eq(nthPos).after("<td style='top:0px' id=celln" + index + " width='100%' valign='top'>" + markup + "</td>");
                this.resultsCanvas.find("# > tbody > tr > " + newId).eq(nthPos).after("<td style='top:0px' id=celln" + index + " width='100%' valign='top'>" + markup + "</td>");
            }
        },
        /**
         * @TODO come comments
         * @param indicatorItem
         * @returns {boolean}
         */
        isExternalIndicator: function (indicatorItem) {
            switch (indicatorItem) {
                case 'ATR':
                case 'STDDEV':
                case 'RSI':
                case 'Aroon Oscillator':
                case 'Aroon Up':
                case 'Aroon Down':
                case 'MACD':
                    {
                        return true;
                    }
                    break;
            }
            return false;
        },
        /**
         *
         * @param json
         * @returns {{length: number, indicatorLookUp: {}}}
         */
        createExternalIndicatorLookUp: function (json) {
            var self = this;
            var extIndicatorLookUp = {};

            var tempIndicatorParentLookUp =
                    {
                        length: 0,
                        indicatorLookUp: {}
                    };

            var j = 1;

            json.forEach(function (el, i, arr) {
                if (self.isExternalIndicator(el.Key) == true) {
                    extIndicatorLookUp[el.Key] = j;
                    j++;
                }
            });
            tempIndicatorParentLookUp.indicatorLookUp = extIndicatorLookUp;
            tempIndicatorParentLookUp.length = j - 1;

            return tempIndicatorParentLookUp;
        },
        /**
         * Create a Lookup
         * @param json
         * @returns {{}}
         */
        createLookUp: function (json) {
            var dataLookUp = {};
            // generate the lookup table for reuse
            json.forEach(function (el, i, arr) {
                dataLookUp[el.Key] = el.Value;
            });

            return dataLookUp;
        },
        initalizeSubWidgets: function (presentationTypes, index, obj, dataLookUp, arraySeries, overlayArray, groupingUnits, yAxisArray, iter, extIndicatorLookUp, mulitipleWidgetLookUp, trendsOverlayArray) {

            //return this.prepareChartData(presentationTypes, index, obj, dataLookUp, arraySeries, overlayArray, groupingUnits, yAxisArray, iter);
            return this.prepareChartData(presentationTypes, index, obj, dataLookUp, arraySeries, overlayArray, groupingUnits, yAxisArray, iter, extIndicatorLookUp, mulitipleWidgetLookUp, trendsOverlayArray);

        },
        /**
         * convert numeric key
         * @param selectChartKey
         * @returns {number}
         */
        convertToNumericKeyID: function (selectChartKey) {
            var accumulated = "";
            var total = 0;
            for (var i = 0; i < selectChartKey.length; i++) {
                var n = selectChartKey.charCodeAt(i);
                accumulated = accumulated + n;
                total = total + n;
            }
            return total;
        },
        displaySummary: function (presentationTypes, presentationTypeIndex, obj, dataLookUp, arraySeries, overlayArray, groupingUnits, yAxisArray) {

        },
        prepareChartDataLegacy: function (presentationTypes, presentationTypeIndex, obj, dataLookUp, arraySeries, overlayArray, groupingUnits, yAxisArray, iter) {
            var self = this;

            //create selectChartKey from loop
            var allCount = 8;
            var allCountIter = 0;
            var selectChartKey = '';

            var bSubWidgetSet = false;

            for (var ss = 0; ss < presentationTypes.SubWidgets.length; ss++) {

                switch (presentationTypes.SubWidgets[ss]) {
                    case 'CorrelationTable':
                        {
                            var indOne = obj.CurrentResult.ProcessedResults.KeyFieldIndex[0];
                            var indTwo = obj.CurrentResult.ProcessedResults.KeyFieldIndex[1];


                            var resultValue = dataLookUp["CorrelationRatio"];

                            var lineSeriesOptions = [],
                                    symbolNames = [];

                            for (var bb = 0; bb < obj.CurrentResult.ResultSymbols[presentationTypeIndex].length; bb++) {
                                symbolNames.push(obj.CurrentResult.ResultSymbols[presentationTypeIndex][bb]);
                            }

                            var correlTabStr = '<table cellpadding="12" cellspacing="12" border="1" style="border-color:#E0E0E0;"><tr style="border-color:#E0E0E0;"><td></td><td>' + symbolNames[0] + '</td></tr>';
                            var tempStr = '<tr style="border-color:#E0E0E0;"><td>' + symbolNames[1] + '</td><td>' + resultValue + '</td></tr></table>';

                            var final = correlTabStr + tempStr;
                            //this.resultsCanvas.find('#tableCanvas > tbody > tr '+ newId)
                            //$("#celln" + presentationTypeIndex)
                            $('<br/>' + final).appendTo(this.resultsCanvas.find('#tableCanvas > tbody > tr > td#celln' + presentationTypeIndex));


                            dataResults = obj.CurrentResult.RawDataResults[0].ChartReadyDataResults;

                            bSubWidgetSet = true;

                            allCountIter++;
                        }
                        break;

                    case 'SMA':
                        {
                            var dataResults = dataLookUp["SMA"];

                            if (dataResults != null || dataResults !== undefined) {
                                var dataLength = dataResults.length;
                                var smaData = [];

                                for (var ri = 0; ri < dataLength; ri++) {
                                    smaData.push([
                                        dataResults[ri][0], // the date
                                        dataResults[ri][1] // the close
                                    ])
                                }

                                var smaChartItem = {
                                    code: 'sma',
                                    name: 'SMA',
                                    color: 'red',
                                    data: [smaData],
                                    dataGrouping: {
                                        units: groupingUnits
                                    }
                                }
                                overlayArray.push(smaChartItem);

                                allCountIter++;
                            }
                        }
                        break;

                    case 'BollingerBands':
                        {
                            var dataUpperBand = dataLookUp["UpperBand"];
                            var dataLowerBand = dataLookUp["LowerBand"];
                            var dataMiddleBand = dataLookUp["MiddleBand"];

                            if (dataMiddleBand != null || dataMiddleBand !== undefined) {
                                var smaOverlayArray = [];
                                var upperBollingerBandArray = [];
                                var lowerBollingerBandArray = [];

                                var dataLength = dataMiddleBand.length;

                                for (var ri = 0; ri < dataLength; ri++) {
                                    smaOverlayArray.push([
                                        dataMiddleBand[ri][0], // the date
                                        dataMiddleBand[ri][1] // the close
                                    ])

                                    upperBollingerBandArray.push([
                                        dataUpperBand[ri][0], // the date
                                        dataUpperBand[ri][1] // the close
                                    ])

                                    lowerBollingerBandArray.push([
                                        dataLowerBand[ri][0], // the date
                                        dataLowerBand[ri][1] // the close
                                    ])
                                }

                                var smaChartItem = {
                                    code: 'sma',
                                    name: 'SMA',
                                    color: 'red',
                                    data: [smaOverlayArray],
                                    dataGrouping: {
                                        units: groupingUnits
                                    }
                                }
                                overlayArray.push(smaChartItem);

                                var bollingerBandsChartItem = {
                                    code: 'bbands',
                                    name: 'Bollinger Bands',
                                    color: 'blue',
                                    data: [lowerBollingerBandArray, upperBollingerBandArray],
                                    dataGrouping: {
                                        units: groupingUnits
                                    }
                                }
                                overlayArray.push(bollingerBandsChartItem);

                                allCountIter++;
                            }

                            self.self.generateSummary(obj, presentationTypeIndex);
                        }
                        break;

                    case 'Aroon Oscillator':
                        {
                            selectChartKey = selectChartKey + "Aroon Oscillator";

                            var dataResults = dataLookUp["Aroon Oscillator"];

                            if (dataResults != null || dataResults !== undefined) {
                                var dataLength = dataResults.length;
                                var aroonOscArray = [];

                                for (var ri = 0; ri < dataLength; ri++) {
                                    aroonOscArray.push([
                                        dataResults[ri][0], // the date
                                        dataResults[ri][1] // the close
                                    ])
                                }

                                var aroonOscChart = {
                                    type: 'area',
                                    name: 'Aroon Oscillator',
                                    data: aroonOscArray,
                                    yAxis: 1,
                                    dataGrouping: {
                                        units: groupingUnits
                                    }
                                }
                                arraySeries.push(aroonOscChart);


                                var chartItemDef = {
                                    title: {
                                        text: 'Aroon Osc'
                                    },
                                    top: yAxisArray[0].height + 90,
                                    height: 100,
                                    offset: 0,
                                    lineWidth: 2
                                };
                                yAxisArray.push(chartItemDef);

                                allCountIter++;
                            }

                            self.self.generateSummary(obj, presentationTypeIndex);
                        }
                        break;

                    case 'Aroon Up':
                        {
                            var indicatorName = "Aroon Up";

                            selectChartKey = selectChartKey + "Aroon Up";

                            var dataResults = dataLookUp["Aroon Up"];

                            if (dataResults != null || dataResults !== undefined) {
                                var dataLength = dataResults.length;
                                var aroonUpArray = [];

                                for (var ri = 0; ri < dataLength; ri++) {
                                    aroonUpArray.push([
                                        dataResults[ri][0], // the date
                                        dataResults[ri][1] // the close
                                    ])
                                }

                                var aroonUpChart = {
                                    type: 'line',
                                    name: indicatorName,
                                    data: aroonUpArray,
                                    yAxis: 1,
                                    dataGrouping: {
                                        units: groupingUnits
                                    }
                                }
                                arraySeries.push(aroonUpChart);

                                var chartItemDef = {
                                    title: {
                                        text: indicatorName
                                    },
                                    top: yAxisArray[0].height + 90,
                                    height: 100,
                                    offset: 0,
                                    lineWidth: 2
                                };
                                yAxisArray.push(chartItemDef);

                                allCountIter++;
                            }
                        }
                        break;

                    case 'Aroon Down':
                        {
                            var indicatorName = "Aroon Down";

                            selectChartKey = selectChartKey + indicatorName;

                            var dataResults = dataLookUp["Aroon Down"];

                            if (dataResults != null || dataResults !== undefined) {
                                var dataLength = dataResults.length;
                                var aroonDownArray = [];

                                for (var ri = 0; ri < dataLength; ri++) {
                                    aroonDownArray.push([
                                        dataResults[ri][0], // the date
                                        dataResults[ri][1] // the close
                                    ])
                                }

                                var aroonDownChart = {
                                    type: 'line',
                                    name: indicatorName,
                                    data: aroonDownArray,
                                    yAxis: 1,
                                    dataGrouping: {
                                        units: groupingUnits
                                    }
                                }
                                arraySeries.push(aroonDownChart);

                                var chartItemDef = {
                                    title: {
                                        text: indicatorName
                                    },
                                    top: yAxisArray[0].height + 90,
                                    height: 100,
                                    offset: 0,
                                    lineWidth: 2
                                };
                                yAxisArray.push(chartItemDef);

                                allCountIter++;
                            }
                        }
                        break;

                    case 'RSI':
                        {
                            var indicatorName = "RSI";

                            selectChartKey = selectChartKey + "RSI";

                            var dataResults = dataLookUp["RSI"];

                            if (dataResults != null || dataResults !== undefined) {
                                var dataLength = dataResults.length;
                                var rsiArray = [];

                                for (var ri = 0; ri < dataLength; ri++) {
                                    rsiArray.push([
                                        dataResults[ri][0], // the date
                                        dataResults[ri][1] // the close
                                    ])
                                }

                                var rsiChart = {
                                    type: 'line',
                                    name: 'RSI',
                                    data: rsiArray,
                                    yAxis: 1,
                                    dataGrouping: {
                                        units: groupingUnits
                                    }
                                }
                                arraySeries.push(rsiChart);

                                var chartItemDef = {
                                    title: {
                                        text: indicatorName
                                    },
                                    top: yAxisArray[0].height + 90,
                                    height: 100,
                                    offset: 0,
                                    lineWidth: 2
                                };
                                yAxisArray.push(chartItemDef);

                                allCountIter++;
                            }

                            self.self.generateSummary(obj, presentationTypeIndex);

                        }
                        break;

                    case 'MACD':
                        {
                            var indicatorName = "MACD";

                            selectChartKey = selectChartKey + "MACD";

                            var dataMACD = dataLookUp["MACDLine"];
                            var dataSignal = dataLookUp["SignalLine"];
                            var dataMACDHistogram = dataLookUp["MACDHistogram"];

                            if (dataMACD != null || dataMACD !== undefined) {
                                var dataLength = dataMACD.length;
                                var macdArray = [];
                                var macdSignalArray = [];
                                var macdHistogramArray = [];

                                for (var ri = 0; ri < dataLength; ri++) {

                                    macdArray.push([
                                        dataMACD[ri][0], // the date
                                        dataMACD[ri][1] // the close
                                    ])

                                    macdSignalArray.push([
                                        dataSignal[ri][0], // the date
                                        dataSignal[ri][1] // the close
                                    ])

                                    macdHistogramArray.push([
                                        dataMACDHistogram[ri][0], // the date
                                        dataMACDHistogram[ri][1] // the close
                                    ])
                                }
                                var axis = 1;

                                var macdChartItem = {
                                    type: 'line',
                                    name: 'MACDline',
                                    data: macdArray,
                                    yAxis: axis,
                                    dataGrouping: {
                                        units: groupingUnits
                                    }
                                }
                                arraySeries.push(macdChartItem);


                                var signalChartItem = {
                                    type: 'line',
                                    name: 'signalLine',
                                    data: macdSignalArray,
                                    yAxis: axis,
                                    dataGrouping: {
                                        units: groupingUnits
                                    }
                                }
                                arraySeries.push(signalChartItem);


                                var macdHistogramChartItem = {
                                    type: 'column',
                                    name: 'MACDHistogram',
                                    data: macdHistogramArray,
                                    yAxis: axis,
                                    dataGrouping: {
                                        units: groupingUnits
                                    }
                                }
                                arraySeries.push(macdHistogramChartItem);


                                var chartItemDef = {
                                    title: {
                                        text: 'MACD'
                                    },
                                    top: yAxisArray[0].height + 90,
                                    height: 100,
                                    offset: 0,
                                    lineWidth: 2
                                };
                                yAxisArray.push(chartItemDef);

                                allCountIter++;
                            }

                            self.self.generateSummary(obj, presentationTypeIndex);

                        }
                        break;

                    case 'ATR':
                        {
                            var indicatorName = "ATR";

                            selectChartKey = selectChartKey + "ATR";

                            var dataResults = dataLookUp["ATR"];

                            if (dataResults != null || dataResults !== undefined) {
                                var dataLength = dataResults.length;
                                var atrArray = [];

                                for (var ri = 0; ri < dataLength; ri++) {
                                    atrArray.push([
                                        dataResults[ri][0], // the date
                                        dataResults[ri][1] // the close
                                    ])
                                }
                                var atrChart = {
                                    type: 'line',
                                    name: 'ATR',
                                    data: atrArray,
                                    yAxis: 1,
                                    dataGrouping: {
                                        units: groupingUnits
                                    }
                                }
                                arraySeries.push(atrChart);

                                var chartItemDef = {
                                    title: {
                                        text: indicatorName
                                    },
                                    top: yAxisArray[0].height + 90,
                                    height: 100,
                                    offset: 0,
                                    lineWidth: 2
                                };
                                yAxisArray.push(chartItemDef);

                                allCountIter++;
                            }

                            self.self.generateSummary(obj, presentationTypeIndex);
                        }
                        break;

                        //case "General Table":
                        //    {
                        //        var indOne = obj.CurrentResult.ProcessedResults.KeyFieldIndex[0];
                        //        var indTwo = obj.CurrentResult.ProcessedResults.KeyFieldIndex[1];

                        //        var resultValue = dataLookUp["CorrelationRatio"];

                        //        var lineSeriesOptions = [],
                        //            symbolNames = [];


                        //        var genTabStr = '<span  style="color:#3a89ff;">Latest: </span><br/> <br/><table cellpadding="12" cellspacing="12" border="1" style="border-color:#E0E0E0;">';


                        //        for (var bb = 0; bb < obj.CurrentResult.ProcessedResults.KeyFieldIndex[0].length; bb++) {

                        //            var selectingIndex = obj.CurrentResult.ProcessedResults.KeyFieldIndex[0][bb];

                        //            genTabStr += '<tr style="border-color:#E0E0E0;"><td>' + obj.CurrentResult.ProcessedResults.Headers[selectingIndex] + '</td><td>' + obj.CurrentResult.ProcessedResults.ComputedResults[0][selectingIndex] + '</td></tr>';
                        //        }

                        //        genTabStr += '</table>';

                        //        var final = genTabStr;

                        //        $('<br/>' + final).appendTo($("#celln0"));

                        //        bSubWidgetSet = true;

                        //        allCountIter++;

                        //    } break;

                    default:
                        {
                            var indOne = obj.CurrentResult.ProcessedResults.KeyFieldIndex[0];
                            var indTwo = obj.CurrentResult.ProcessedResults.KeyFieldIndex[1];

                            var resultValue = dataLookUp["CorrelationRatio"];

                            var lineSeriesOptions = [],
                                    symbolNames = [];


                            self.self.generateSummary(obj, presentationTypeIndex);


                            bSubWidgetSet = true;

                            allCountIter++;
                        }
                        break;
                }
            }

            //if (bSubWidgetSet === true) {
            //    $("#resultCanvas").append($('<br/><hr style="border: 0; color: #9E9E9E; background-color: #9E9E9E; height: 1px; width: 100%; text-align: left;" />'));
            //}
        },
        widgetAlreadyUsed: function (presentationItem, widgetUsedList) {

            for (var t = 0; t < widgetUsedList.length; t++) {
                if (presentationItem == widgetUsedList[t]) {
                    return true;
                }
            }
            widgetUsedList.push(presentationItem);
            return false;
        },
        generateRandomColour: function () {

            var textArray = [
                '#5dff4f',
                'blue',
                '#006a72',
                '#0055a6',
                '#ad655f',
                '#f3e877'
            ];
            var randomNumber = Math.floor(Math.random() * textArray.length);
            return textArray[randomNumber];
        },
        prepareChartData: function (presentationTypes, presentationTypeIndex, obj, dataLookUp, arraySeries, overlayArray, groupingUnits, yAxisArray, iter, extIndicatorLookUp, mulitipleWidgetLookUp, trendsOverlayArray) {
            var self = this;
            //create selectChartKey from loop
            var allCount = 8;
            var allCountIter = 0;
            var selectChartKey = '';

            var bSubWidgetSet = false;

            var widgetUsedList = [];

            var indicatorPos = 0;
            if (yAxisArray != null && typeof yAxisArray != 'undefined') {
                if (yAxisArray.length > 0) {
                    indicatorPos = yAxisArray[0].height;
                }
            }

            var indSpacing = 90;
            var indicatorGap = 0; //handles gap between bottom chart indicators
            var summariesSet = false;

            for (var ss = 0; ss < presentationTypes.SubWidgets.length; ss++) {

                switch (presentationTypes.SubWidgets[ss]) {
                    case 'CorrelationTable':
                        {
                            var indOne = obj.CurrentResult.ProcessedResults.KeyFieldIndex[0];
                            var indTwo = obj.CurrentResult.ProcessedResults.KeyFieldIndex[1];


                            var resultValue = dataLookUp["CorrelationRatio"];

                            var lineSeriesOptions = [],
                                    symbolNames = [];

                            for (var bb = 0; bb < obj.CurrentResult.ResultSymbols[presentationTypeIndex].length; bb++) {
                                symbolNames.push(obj.CurrentResult.ResultSymbols[presentationTypeIndex][bb]);
                            }

                            var correlTabStr = '<table cellpadding="12" cellspacing="12" border="1" style="border-color:#E0E0E0;"><tr style="border-color:#E0E0E0;"><td></td><td>' + symbolNames[0] + '</td></tr>';
                            var tempStr = '<tr style="border-color:#E0E0E0;"><td>' + symbolNames[1] + '</td><td>' + resultValue + '</td></tr></table>';

                            var final = correlTabStr + tempStr;

                            $('<br/>' + final).appendTo($("#celln" + presentationTypeIndex));


                            dataResults = obj.CurrentResult.RawDataResults[0].ChartReadyDataResults;

                            bSubWidgetSet = true;

                            allCountIter++;
                        }
                        break;

                    case 'SMA':
                        {
                            var dataResults = {};
                            var widgetName = "";
                            var currentCount = mulitipleWidgetLookUp["SMA"];
                            if (typeof currentCount !== 'undefined') {
                                dataResults = dataLookUp["SMA" + ss];
                                widgetName = obj.CurrentResult.PresentationTypes[0].SubWidgetsAltName[ss];
                            }
                            else {
                                dataResults = dataLookUp["SMA"];
                                widgetName = "SMA";
                            }


                            if (dataResults != null || dataResults !== undefined) {
                                var dataLength = dataResults.length;
                                var smaData = [];

                                for (var ri = 0; ri < dataLength; ri++) {
                                    smaData.push([
                                        dataResults[ri][0], // the date
                                        dataResults[ri][1] // the close
                                    ])
                                }

                                //For handling multilple widgets of the same
                                //kind, this diversifies color
                                var selectedColor = "red";
                                if (self.widgetAlreadyUsed('SMA', widgetUsedList)) {
                                    selectedColor = self.generateRandomColour();
                                }

                                //var smaChartItem = {
                                //    code: 'sma',
                                //    name: widgetName,
                                //    color: selectedColor,
                                //    data: [smaData],
                                //    dataGrouping: {
                                //        units: groupingUnits
                                //    }
                                //}

                                var smaChartItem = {
                                    code: 'sma',
                                    name: widgetName,
                                    color: selectedColor,
                                    data: [smaData]
                                }

                                overlayArray.push(smaChartItem);

                                allCountIter++;

                                if (summariesSet === false) {
                                    self.generateSummary(obj, presentationTypeIndex);
                                    summariesSet = true;
                                }
                            }
                        }
                        break;

                    case 'BollingerBands':
                        {
                            var dataUpperBand = dataLookUp["UpperBand"];
                            var dataLowerBand = dataLookUp["LowerBand"];
                            var dataMiddleBand = dataLookUp["MiddleBand"];

                            if (dataMiddleBand != null || dataMiddleBand !== undefined) {
                                var smaOverlayArray = [];
                                var upperBollingerBandArray = [];
                                var lowerBollingerBandArray = [];

                                var dataLength = dataMiddleBand.length;

                                for (var ri = 0; ri < dataLength; ri++) {
                                    smaOverlayArray.push([
                                        dataMiddleBand[ri][0], // the date
                                        dataMiddleBand[ri][1] // the close
                                    ])

                                    upperBollingerBandArray.push([
                                        dataUpperBand[ri][0], // the date
                                        dataUpperBand[ri][1] // the close
                                    ])

                                    lowerBollingerBandArray.push([
                                        dataLowerBand[ri][0], // the date
                                        dataLowerBand[ri][1] // the close
                                    ])
                                }

                                //var smaChartItem = {
                                //    code: 'sma',
                                //    name: 'SMA',
                                //    color: 'red',
                                //    data: [smaOverlayArray],
                                //    dataGrouping: {
                                //        units: groupingUnits
                                //    }
                                //}

                                var smaChartItem = {
                                    code: 'sma',
                                    name: 'SMA',
                                    color: 'red',
                                    data: [smaOverlayArray]
                                }

                                overlayArray.push(smaChartItem);

                                //var bollingerBandsChartItem = {
                                //    code: 'bbands',
                                //    name: 'Bollinger Bands',
                                //    color: 'blue',
                                //    data: [lowerBollingerBandArray, upperBollingerBandArray],
                                //    dataGrouping: {
                                //        units: groupingUnits
                                //    }
                                //}

                                var bollingerBandsChartItem = {
                                    code: 'bbands',
                                    name: 'Bollinger Bands',
                                    color: 'blue',
                                    data: [lowerBollingerBandArray, upperBollingerBandArray]
                                }

                                overlayArray.push(bollingerBandsChartItem);
                                allCountIter++;

                                if (summariesSet === false) {
                                    self.generateSummary(obj, presentationTypeIndex);
                                    summariesSet = true;
                                }
                            }
                        }
                        break;

                    case 'Aroon Oscillator':
                        {
                            var indicatorName = "Aroon Oscillator";
                            selectChartKey = selectChartKey + indicatorName;
                            var yAxisPos = extIndicatorLookUp.indicatorLookUp[indicatorName];

                            var dataResults = dataLookUp["Aroon Oscillator"];

                            if (dataResults != null || dataResults !== undefined) {
                                var dataLength = dataResults.length;
                                var aroonOscArray = [];

                                for (var ri = 0; ri < dataLength; ri++) {
                                    aroonOscArray.push([
                                        dataResults[ri][0], // the date
                                        dataResults[ri][1] // the close
                                    ])
                                }

                                //var aroonOscChart = {
                                //    type: 'area',
                                //    name: 'Aroon Oscillator',
                                //    data: aroonOscArray,
                                //    yAxis: yAxisPos,
                                //    dataGrouping: {
                                //        units: groupingUnits
                                //    }
                                //}
                                var aroonOscChart = {
                                    type: 'area',
                                    name: 'Aroon Oscillator',
                                    data: aroonOscArray,
                                    yAxis: yAxisPos
                                }

                                arraySeries.push(aroonOscChart);

                                indicatorPos = indicatorPos + indSpacing + indicatorGap;
                                var chartItemDef = {
                                    title: {
                                        text: 'Aroon Osc'
                                    },
                                    top: indicatorPos,
                                    height: 100,
                                    offset: 0,
                                    lineWidth: 2
                                };
                                yAxisArray.push(chartItemDef);

                                allCountIter++;

                                if (summariesSet === false) {
                                    self.generateSummary(obj, presentationTypeIndex);
                                    summariesSet = true;
                                }
                            }
                        }
                        break;

                    case 'Aroon Up':
                        {
                            var indicatorName = "Aroon Up";
                            var yAxisPos = extIndicatorLookUp.indicatorLookUp[indicatorName];

                            selectChartKey = selectChartKey + "Aroon Up";

                            var dataResults = dataLookUp["Aroon Up"];

                            if (dataResults != null || dataResults !== undefined) {
                                var dataLength = dataResults.length;
                                var aroonUpArray = [];

                                for (var ri = 0; ri < dataLength; ri++) {
                                    aroonUpArray.push([
                                        dataResults[ri][0], // the date
                                        dataResults[ri][1] // the close
                                    ])
                                }

                                //var aroonUpChart = {
                                //    type: 'line',
                                //    name: indicatorName,
                                //    data: aroonUpArray,
                                //    yAxis: yAxisPos,
                                //    dataGrouping: {
                                //        units: groupingUnits
                                //    }
                                //}

                                var aroonUpChart = {
                                    type: 'line',
                                    name: indicatorName,
                                    data: aroonUpArray,
                                    yAxis: yAxisPos,
                                }

                                arraySeries.push(aroonUpChart);

                                indicatorPos = indicatorPos + indSpacing + indicatorGap;

                                var chartItemDef = {
                                    title: {
                                        text: indicatorName
                                    },
                                    top: indicatorPos,
                                    height: 100,
                                    offset: 0,
                                    lineWidth: 2
                                };
                                yAxisArray.push(chartItemDef);

                                allCountIter++;
                                if (summariesSet === false) {
                                    self.generateSummary(obj, presentationTypeIndex);
                                    summariesSet = true;
                                }
                            }
                        }
                        break;

                    case 'Aroon Down':
                        {
                            var indicatorName = "Aroon Down";
                            var yAxisPos = extIndicatorLookUp.indicatorLookUp[indicatorName];

                            selectChartKey = selectChartKey + indicatorName;

                            var dataResults = dataLookUp["Aroon Down"];

                            if (dataResults != null || dataResults !== undefined) {
                                var dataLength = dataResults.length;
                                var aroonDownArray = [];

                                for (var ri = 0; ri < dataLength; ri++) {
                                    aroonDownArray.push([
                                        dataResults[ri][0], // the date
                                        dataResults[ri][1] // the close
                                    ])
                                }

                                //var aroonDownChart = {
                                //    type: 'line',
                                //    name: indicatorName,
                                //    data: aroonDownArray,
                                //    yAxis: yAxisPos,
                                //    dataGrouping: {
                                //        units: groupingUnits
                                //    }
                                //}

                                var aroonDownChart = {
                                    type: 'line',
                                    name: indicatorName,
                                    data: aroonDownArray,
                                    yAxis: yAxisPos
                                }

                                arraySeries.push(aroonDownChart);

                                indicatorPos = indicatorPos + indSpacing + indicatorGap;

                                var chartItemDef = {
                                    title: {
                                        text: indicatorName
                                    },
                                    top: indicatorPos,
                                    height: 100,
                                    offset: 0,
                                    lineWidth: 2
                                };
                                yAxisArray.push(chartItemDef);

                                allCountIter++;

                                if (summariesSet === false) {
                                    self.generateSummary(obj, presentationTypeIndex);
                                    summariesSet = true;
                                }
                            }
                        }
                        break;

                    case 'STDDEV':
                    case 'RSI':
                        {
                            var indicatorName = presentationTypes.SubWidgets[ss];
                            var yAxisPos = extIndicatorLookUp.indicatorLookUp[indicatorName];


                            selectChartKey = selectChartKey + indicatorName;

                            var dataResults = dataLookUp[indicatorName];

                            if (dataResults != null || dataResults !== undefined) {
                                var dataLength = dataResults.length;
                                var rsiArray = [];

                                for (var ri = 0; ri < dataLength; ri++) {
                                    rsiArray.push([
                                        dataResults[ri][0], // the date
                                        dataResults[ri][1] // the close
                                    ])
                                }

                                //var rsiChart = {
                                //    type: 'line',
                                //    name: indicatorName,
                                //    data: rsiArray,
                                //    yAxis: yAxisPos,
                                //    dataGrouping: {
                                //        units: groupingUnits
                                //    }
                                //}


                                var rsiChart = {
                                    type: 'line',
                                    name: indicatorName,
                                    data: rsiArray,
                                    yAxis: yAxisPos
                                }

                                arraySeries.push(rsiChart);

                                indicatorPos = indicatorPos + indSpacing + indicatorGap;

                                var chartItemDef = {
                                    title: {
                                        text: indicatorName
                                    },
                                    top: indicatorPos,
                                    height: 100,
                                    offset: 0,
                                    lineWidth: 2
                                };
                                yAxisArray.push(chartItemDef);

                                allCountIter++;

                                if (summariesSet === false) {
                                    self.generateSummary(obj, presentationTypeIndex);
                                    summariesSet = true;
                                }
                            }
                        }
                        break;

                    case 'Stochastic':
                        {
                            var indicatorName = presentationTypes.SubWidgets[ss];

                            selectChartKey = selectChartKey + indicatorName;

                            var stochasticPKDataTemp = dataLookUp["OutSlowKData"];
                            var stochasticPDDataTemp = dataLookUp["OutSlowDData"];


                            if (stochasticPKDataTemp != null || stochasticPKDataTemp !== undefined) {
                                var dataLength = stochasticPKDataTemp.length;
                                var stochasticPKData = [];
                                var stochasticPDData = [];

                                for (var ri = 0; ri < dataLength; ri++) {

                                    stochasticPKData.push([
                                        stochasticPKDataTemp[ri][0], // the date
                                        stochasticPKDataTemp[ri][1] // the close
                                    ])

                                    stochasticPDData.push([
                                        stochasticPDDataTemp[ri][0], // the date
                                        stochasticPDDataTemp[ri][1] // the close
                                    ])
                                }
                                var axis = 1;

                                //var macdChartItem ={
                                //    type: 'line',
                                //    name: 'Stochastic %K ',
                                //    data: stochasticPKData,
                                //    yAxis: axis,
                                //    dashStyle: 'ShortDash',
                                //    dataGrouping: {
                                //        units: groupingUnits
                                //    }
                                //}

                                var macdChartItem = {
                                    type: 'line',
                                    name: 'Stochastic %K ',
                                    data: stochasticPKData,
                                    yAxis: axis,
                                    dashStyle: 'ShortDash'
                                }

                                arraySeries.push(macdChartItem);


                                //var signalChartItem = {
                                //    type: 'line',
                                //    name: 'Stochastic %D ',
                                //    data: stochasticPDData,
                                //    dashStyle: 'LongDash',
                                //    yAxis: axis,
                                //    dataGrouping: {
                                //        units: groupingUnits
                                //    }
                                //}


                                var signalChartItem = {
                                    type: 'line',
                                    name: 'Stochastic %D ',
                                    data: stochasticPDData,
                                    dashStyle: 'LongDash',
                                    yAxis: axis
                                }

                                arraySeries.push(signalChartItem);

                                indicatorPos = indicatorPos + indSpacing + indicatorGap;

                                var chartItemDef = {
                                    title: {
                                        text: 'Stochastic'
                                    },
                                    top: indicatorPos,
                                    height: 100,
                                    offset: 0,
                                    lineWidth: 2
                                };
                                yAxisArray.push(chartItemDef);

                                allCountIter++;

                                if (summariesSet === false) {
                                    self.generateSummary(obj, presentationTypeIndex);
                                    summariesSet = true;
                                }
                            }
                        }
                        break;

                    case 'MACD':
                        {
                            var indicatorName = "MACD";

                            selectChartKey = selectChartKey + "MACD";

                            var dataMACD = dataLookUp["MACDLine"];
                            var dataSignal = dataLookUp["SignalLine"];
                            var dataMACDHistogram = dataLookUp["MACDHistogram"];

                            if (dataMACD != null || dataMACD !== undefined) {
                                var dataLength = dataMACD.length;
                                var macdArray = [];
                                var macdSignalArray = [];
                                var macdHistogramArray = [];

                                for (var ri = 0; ri < dataLength; ri++) {

                                    macdArray.push([
                                        dataMACD[ri][0], // the date
                                        dataMACD[ri][1] // the close
                                    ])

                                    macdSignalArray.push([
                                        dataSignal[ri][0], // the date
                                        dataSignal[ri][1] // the close
                                    ])

                                    macdHistogramArray.push([
                                        dataMACDHistogram[ri][0], // the date
                                        dataMACDHistogram[ri][1] // the close
                                    ])
                                }
                                var axis = 1;

                                //var macdChartItem = {
                                //    type: 'line',
                                //    name: 'MACDline',
                                //    data: macdArray,
                                //    yAxis: axis,
                                //    dataGrouping: {
                                //        units: groupingUnits
                                //    }
                                //}

                                var macdChartItem = {
                                    type: 'line',
                                    name: 'MACDline',
                                    data: macdArray,
                                    yAxis: axis
                                }

                                arraySeries.push(macdChartItem);


                                //var signalChartItem = {
                                //    type: 'line',
                                //    name: 'signalLine',
                                //    data: macdSignalArray,
                                //    yAxis: axis,
                                //    dataGrouping: {
                                //        units: groupingUnits
                                //    }
                                //}

                                var signalChartItem = {
                                    type: 'line',
                                    name: 'signalLine',
                                    data: macdSignalArray,
                                    yAxis: axis
                                }
                                arraySeries.push(signalChartItem);


                                //var macdHistogramChartItem = {
                                //    type: 'column',
                                //    name: 'MACDHistogram',
                                //    data: macdHistogramArray,
                                //    yAxis: axis,
                                //    dataGrouping: {
                                //        units: groupingUnits
                                //    }
                                //}

                                var macdHistogramChartItem = {
                                    type: 'column',
                                    name: 'MACDHistogram',
                                    data: macdHistogramArray,
                                    yAxis: axis
                                }

                                arraySeries.push(macdHistogramChartItem);

                                indicatorPos = indicatorPos + indSpacing + indicatorGap;

                                var chartItemDef = {
                                    title: {
                                        text: 'MACD'
                                    },
                                    top: indicatorPos,
                                    height: 100,
                                    offset: 0,
                                    lineWidth: 2
                                };
                                yAxisArray.push(chartItemDef);

                                allCountIter++;

                                if (summariesSet === false) {
                                    self.generateSummary(obj, presentationTypeIndex);
                                    summariesSet = true;
                                }
                            }
                        }
                        break;

                    case 'ATR':
                        {
                            var indicatorName = "ATR";
                            var yAxisPos = extIndicatorLookUp.indicatorLookUp[indicatorName];

                            selectChartKey = selectChartKey + "ATR";

                            var dataResults = dataLookUp["ATR"];

                            if (dataResults != null || dataResults !== undefined) {
                                var dataLength = dataResults.length;
                                var atrArray = [];

                                for (var ri = 0; ri < dataLength; ri++) {
                                    atrArray.push([
                                        dataResults[ri][0], // the date
                                        dataResults[ri][1] // the close
                                    ])
                                }
                                //var atrChart = {
                                //    type: 'line',
                                //    name: 'ATR',
                                //    data: atrArray,
                                //    yAxis: yAxisPos,
                                //    dataGrouping: {
                                //        units: groupingUnits
                                //    }
                                //}

                                var atrChart = {
                                    type: 'line',
                                    name: 'ATR',
                                    data: atrArray,
                                    yAxis: yAxisPos
                                }

                                arraySeries.push(atrChart);

                                indicatorPos = indicatorPos + indSpacing + indicatorGap;

                                var chartItemDef = {
                                    title: {
                                        text: indicatorName
                                    },
                                    top: indicatorPos,
                                    height: 100,
                                    offset: 0,
                                    lineWidth: 2
                                };
                                yAxisArray.push(chartItemDef);

                                allCountIter++;

                                if (summariesSet === false) {
                                    self.generateSummary(obj, presentationTypeIndex);
                                    summariesSet = true;
                                }
                            }
                        }
                        break;

                    case 'Trends':
                        {
                            var dataResults = {};
                            var widgetName = "";
                            var currentCount = mulitipleWidgetLookUp["Trends"];
                            if (typeof currentCount !== 'undefined') {
                                dataResults = dataLookUp["Trends" + ss];
                                widgetName = obj.CurrentResult.PresentationTypes[0].SubWidgetsAltName[ss];
                            }
                            else {
                                dataResults = dataLookUp["Trends"];
                                widgetName = "Trends";
                            }


                            if (dataResults != null || dataResults !== undefined) {
                                var dataLength = dataResults.length;
                                var smaData = [];

                                for (var ri = 0; ri < dataLength; ri++) {
                                    smaData.push([
                                        dataResults[ri][0], // the date
                                        dataResults[ri][1] // the close
                                    ])
                                }

                                //For handling multilple widgets of the same
                                //kind, this diversifies color
                                var selectedColor = "red";
                                if (self.widgetAlreadyUsed('Trends', widgetUsedList)) {
                                    selectedColor = self.generateRandomColour();
                                }

                                //var smaChartItem = {
                                //    code: 'sma',
                                //    name: widgetName,
                                //    color: selectedColor,
                                //    data: [smaData],
                                //    dataGrouping: {
                                //        units: groupingUnits
                                //    }
                                //}

                                var smaChartItem = {
                                    //code: 'sma',
                                    //name: widgetName,
                                    //color: selectedColor,
                                    //data: [smaData],

                                    series: arraySeries[presentationTypeIndex].data,
                                    name: "Slope Line",
                                    startDate: dataResults[0][0],
                                    lineWidth: 3,
                                    color: 'red',
                                    startValue: dataResults[0][1],
                                    endDate: dataResults[1][0],
                                    endValue: dataResults[1][1]


                                            //series : arraySeries
                                            //name: "Slope Line",
                                            //startDate: 1430485200000,
                                            //lineWidth: 3,

                                            //startValue: 120,
                                            //endDate: 1430935200000,
                                            //endValue: 150


                                }

                                trendsOverlayArray.push(smaChartItem);

                                allCountIter++;

                                if (summariesSet === false) {
                                    self.generateSummary(obj, presentationTypeIndex);
                                    summariesSet = true;
                                }
                            }
                        }
                        break;

                    default:
                        {
                            var indOne = obj.CurrentResult.ProcessedResults.KeyFieldIndex[0];
                            var indTwo = obj.CurrentResult.ProcessedResults.KeyFieldIndex[1];

                            var resultValue = dataLookUp["CorrelationRatio"];

                            var lineSeriesOptions = [],
                                    symbolNames = [];

                            if (summariesSet === false) {
                                self.generateSummary(obj, presentationTypeIndex);
                                summariesSet = true;
                            }
                            bSubWidgetSet = true;
                            allCountIter++;
                        }
                        break;
                }
                indicatorGap = indicatorGap + 30;
            }

            //if (bSubWidgetSet === true) {
            //    $("#resultCanvas").append($('<br/><hr style="border: 0; color: #9E9E9E; background-color: #9E9E9E; height: 1px; width: 100%; text-align: left;" />'));
            //}
        },
        /**
         * @TODO comments what this does
         * @param obj
         * @param presentationTypeIndex
         */
        generateSummary: function (obj, presentationTypeIndex) {

            var genTabStr = "<table cellpadding='8' cellspacing='20' style='width:100%'><tr><td style='width:20%; border-left: 0px solid grey; vertical-align: top;'>";
            genTabStr += "<span style='color:#3a89ff;'><strong>Detailed Facts: </strong></span><br/> <br/>"
            genTabStr += "<table cellpadding='8' cellspacing='8' border='1' style='border-color:#E0E0E0;'>";


            for (var bb = 0; bb < obj.CurrentResult.ProcessedResults.KeyFieldIndex[presentationTypeIndex].length; bb++) {

                var selectingIndex = obj.CurrentResult.ProcessedResults.KeyFieldIndex[presentationTypeIndex][bb];

                genTabStr += "<tr style='border-color:#E0E0E0;'><td>" + obj.CurrentResult.ProcessedResults.Headers[selectingIndex]
                        + "</td><td>"
                        + obj.CurrentResult.ProcessedResults.ComputedResults[0][selectingIndex] + '</td></tr>';
            }
            genTabStr += "</table></td>";

            var firstSummary = obj.CurrentResult.RawDataResults[presentationTypeIndex].Summaries[0];
            var summaryMore = obj.CurrentResult.RawDataResults[presentationTypeIndex].Summaries[1];

            var ignoreMoreSummary = false;

            if (typeof firstSummary !== 'undefined') {
                if (!firstSummary) {
                    firstSummary = summaryMore;
                    ignoreMoreSummary = true;
                }

                if (ignoreMoreSummary === false) {

                    genTabStr += "<td valign='top' style='width:40%; border-left: 1px solid grey; border-right: 1px solid grey; vertical-align: top;'>";
                    genTabStr += "<div style='margin-left:10px;margin-right:10px;'><span style='color:#3a89ff;'><strong>Tabular Summary:</strong> </span><br/> <br/>";
                    genTabStr += firstSummary;
                    genTabStr += "</div></td>";
                }
            }


            if (ignoreMoreSummary === false) {
                if (typeof summaryMore !== 'undefined') {

                    genTabStr += "<td valign='top' style='border-left: 0px solid grey; border-right: 0px solid grey; vertical-align: top;>";
                    genTabStr += "<div style='margin-left:10px;margin-right:10px;'><span style='color:#3a89ff;'><strong>Analysis Summary:</strong> </span><br/>" +
                            summaryMore + "</td>";
                }
            }
            genTabStr += "</tr></table>";


            var final = genTabStr;
            //$('<br/>' + final).appendTo($("#celln" + presentationTypeIndex));
            $(final).appendTo(this.resultsCanvas.find('#tableCanvas > tbody > tr > td#celln' + presentationTypeIndex));

            var allElements = this.resultsCanvas.find('.genericResultsTable'); //$('.genericResultsTable');

            // Function that renders the list items from our records
            function ulWriter(rowIndex, record, columns, cellWriter) {
                var cssClass = "span4", li;
                if (rowIndex % 3 === 0) {
                    cssClass += ' first';
                }
                li = '<li class="' + cssClass + '"><div class="thumbnail"><div class="thumbnail-image">' + record.thumbnail + '</div><div class="caption">' + record.caption + '</div></div></li>';
                return li;
            }

            // Function that creates our records from the DOM when the page is loaded
            function ulReader(index, li, record) {
                var $li = $(li),
                        $caption = $li.find('.caption');
                record.thumbnail = $li.find('.thumbnail-image').html();
                record.caption = $caption.html();
                record.label = $caption.find('h3').text();
                record.description = $caption.find('p').text();
                record.color = $li.data('color');
            }

            for (var j = 0; j < allElements.length; j++) {
                var idSelect = allElements[j].id;

                $(allElements[j]).dynatable({
                    table: {
                        defaultColumnIdStyle: 'trimDash'
                    },
                    features: {
                        paginate: true,
                        search: false,
                        recordCount: true,
                        perPageSelect: false
                    }

                });
            }

        },
        selectMiniChart: function (presentationTypeIndex, obj, highlighterArray, dataLookUp, arraySeries, overlayArray, yAxisArray) {

            var chartClassName = 'chartspace dialogchart' + presentationTypeIndex;

            var classOnly = '.dialogchart' + presentationTypeIndex;

            var dataPrep = [];
            var d, datePoint;


            var dataResultsT = dataLookUp["RAW"];

            var chartData;

            if (dataResultsT != null || dataResultsT !== undefined) {

                var lineSeriesOptions = [],
                        symbolNames = [];

                var volume_CandleStick = [];

                for (var bb = 0; bb < obj.CurrentResult.ResultSymbols[presentationTypeIndex].length; bb++) {
                    symbolNames.push(obj.CurrentResult.ResultSymbols[presentationTypeIndex][bb]);
                }

                var dataLength = dataResultsT.length;

                if (dataLength > 0) {

                    var dateTimeTemp = dataResultsT[1][0] - dataResultsT[0][0];

                    var bIntradayChart = true;

                    if (dateTimeTemp >= 86400000) {
                        bIntradayChart = false;
                    }

                    var buttonSetup = {selected: 1};

                    if (bIntradayChart) {
                        var buttonsArray = [
                            {
                                type: 'hour',
                                count: 1,
                                text: '1h'
                            },
                            {
                                type: 'hour',
                                count: 2,
                                text: '2h'
                            },
                            {
                                type: 'hour',
                                count: 3,
                                text: '3h'
                            },
                            {
                                type: 'day',
                                count: 1,
                                text: '1D'
                            },
                            {
                                type: 'all',
                                count: 1,
                                text: 'All'
                            }
                        ];

                        buttonSetup = {
                            buttons: buttonsArray,
                            selected: 2,
                            inputEnabled: false
                        }
                    }

                    if (yAxisArray.length == 1) {
                        yAxisArray[0].height = 400;
                    }

                    // create the chart

                    var chartInfo = {
                        chartID: classOnly,
                        chartData: {
                            title: {
                                text: symbolNames[0]
                            },
                            rangeSelector: buttonSetup,
                            yAxis: yAxisArray,
                            series: arraySeries,
                            highlighted: true,
                            highlightRegion: highlighterArray,
                            overlay: overlayArray

                        }
                    }

                    chartData = chartInfo;
                }
            }
            return chartData;
        }
    });

    return TradeRiserComponent;
});