/**
 * Created with IntelliJ IDEA.
 * User: RDAsante
 * Date: 19/10/15
 * Time: 15:43
 * To change this template use File | Settings | File Templates.
 */

define(['../views/abstract-view','backbone', '../config/tr-chart-helper', 'highstock'], function(AbstractView, Backbone, chartHelper, highcharts){


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


	var TradeRiserComponent =  AbstractView.extend('TradeRiserComponent',{
		initialize: function(){

			this.constructor.__super__.initialize.apply(this, arguments);

			this.render();

		},
		render:function(){

			return this;
		},

		/**
		 * RenderResults
		 * @param returnedData
		 */
		renderQueryResults: function (returnedData) {
		var self  = this;
		try
		{
			var loadchart = document.getElementById("loadchartDia");
			if (loadchart != null || loadchart != 'defined') {
				loadchart.style.display = 'none';
			}

			var json = returnedData;
			var obj = JSON && JSON.parse(json) || $.parseJSON(json);

			if (obj != "") {
				if (obj != null || obj != 'undefined') {

					var assetClassName = obj.ResultSummaries[0].SymbolID;

					for (var i = 0; i < obj.ResultSummaries.length; i++) {

						var extraFieldsArray = new Array();

						var tings = "";
						var limit = 2;
						if (obj.ResultSummaries[i].KeyResultField.length <= 2) { limit = obj.ResultSummaries[i].KeyResultField.length; }

						//for (var n = 0; n < obj.ResultSummaries[i].KeyResultField.length; n++) {
						for (var n = 0; n < limit; n++) {

							var str = JSON.stringify(obj.ResultSummaries[i].KeyResultField[n]);
							var str = str.replace('"', ' ');
							var resn = str.replace('"', ' ');
							var resv = resn.replace('}', ' ');
							var resf = resv.replace('{', ' ');
							var ress = resf.replace(',', ' ');

							var tempArray = obj.ResultSummaries[i].KeyResultField[n];

							var extraFields = [{
								keyfield: tempArray[0] + ' : ', keydata: tempArray[1]
							}];

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

						self.onDemandResults.push(resultItem);

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
		catch (ex)
		{
			alert(ex);
		}

		},

		displayResults: function(obj){
			var self  = this;
			$(this.el).empty();

			$(".pane").width(self.paneFixWidth);

			var resultsData = new ResultsData();

			var arraySeries = [];
			var overlayArray = [];
			var highlighterArray = [];
			var yAxisArray = []; //has to be double quotes


			var presentationTypeCount = obj.CurrentResult.PresentationTypes.length;

			if (presentationTypeCount > 0) {
				$(this.el).append($('<br/>'
					+ '<table id="tableCanvas" width="100%" cellpadding="15" cellspacing="1" border="1" style="border-color:#E0E0E0;"></table>'));

			}

			var rawDataResults = obj.CurrentResult.RawDataResults;

			var selectChartKey = '';

			var iterRow = 0;
			var iter = 0;

			//Main widget
			try {
				for (var pp = 0; pp < presentationTypeCount; pp++, iterRow++) {

					var json = rawDataResults[pp].ChartReadyDataResults;
					var dataLookUp = self.createLookUp(json);


					switch (obj.CurrentResult.PresentationTypes[pp].MainWidget) {
						case 'Table':
						{

						} break;

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

								var buttonSetup = { selected: 4 };

								if (bIntradayChart) {
									var buttonsArray = [{
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
										}, {
											type: 'all',
											count: 1,
											text: 'All'
										}];

									buttonSetup = {
										buttons: buttonsArray,
										selected: 2,
										inputEnabled: false
									}
								}


								$('.correlationChart').highcharts('StockChart', {
									chart: {
									},
									rangeSelector: buttonSetup,
									yAxis: {
										labels: {
											formatter: function () {
												return (this.value > 0 ? '+' : '') + this.value + '%';
											}
										},
										plotLines: [{
											value: 0,
											width: 2,
											color: 'silver'
										}]
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
								});
							}


							// }

							self.initalizeSubWidgets(obj.CurrentResult.PresentationTypes[pp], pp, obj, dataLookUp, resultsData, iter);

						} break;

						case 'CandleStickChart':
						{
							arraySeries = []; //test
							overlayArray = [];
							highlighterArray = [];
							yAxisArray = []; //has to be double quotes


							var chartClassName = 'chartspace dialogchart' + pp;
							//var markup = "<div class='widgetTitle'>15 Timeframe</div><br/><div class='" + chartClassName + "'style='height: 610px; width:50%'></div>";


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
								var groupingUnits = [[
									'week',                         // unit name
									[1]                             // allowed multiples
								], [
									'month',
									[1, 2, 3, 4, 6]
								]];


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

									rawDataResults[pp].HighLightRegion[hl].Comment.split("**");;


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
								self.initalizeSubWidgets(obj.CurrentResult.PresentationTypes[pp], pp, obj, dataLookUp, arraySeries, overlayArray, groupingUnits, yAxisArray, iter);


								self.selectMiniChart(presentationTypeIndex, obj, highlighterArray, dataLookUp, arraySeries, overlayArray, yAxisArray);
							}

						} break;
					}

					if (iterRow == 2) {
						iterRow = 0;
						iter++;
					}
				}

				//performance stats
				self.LoadPerformanceStatistics(obj);


				//disclaimer
				$(this.el).append($('<br/><br/><div id="riskDisclaimer"><h2>Risk Disclaimer</h2><a class="naviPos" href="#performStatsButton">Top</a><p>Please acknowledge the following: <br/>The Charts are provided'
					+  '" as is", without warranty or guarantee of any kind, including but not limited to the warranties of merchantability and fitness for a particular purpose.'
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



			}
			catch (err) {
				alert(err);
			}
		},

		LoadPerformanceStatistics: function (obj) {

		var presentationTypeCount = obj.CurrentResult.PresentationTypes.length;

		for (var pp = 0; pp < presentationTypeCount; pp++) {

			if (obj.CurrentResult.RawDataResults[pp].PerformanceStatistics.length > 0) {
				$(this.el).append($("<div id='performanceStats'><h2>Performance Statistics</h2><a class='naviPos' href='#performStatsButton'>Top</a>"));

				//$(this.el).append($("<div class ='performanceStatsNote'>*Below are listed table(s) of performance statistics which predominantly shows the pattern recoginition rate and this tells you how reliable the recognition is for the symbol."
				//    + "<br/>The percentage value gains more significance and value over time as the number of patterns found increases.</div>"));


				$(this.el).append($("<div class ='performanceStatsNote'>" + obj.CurrentResult.RawDataResults[pp].PerformanceStatistics[0].Description + "</div>"));



				break;
			}
		}


		for (var pp = 0; pp < presentationTypeCount; pp++) {

			//header management
			for (var mm = 0; mm < obj.CurrentResult.RawDataResults[pp].PerformanceStatistics.length; mm++) {

				var tableId = "performanceStatsTable" + mm;

				$(this.el).append($("<table class= 'performanceStatsTable' id = " + tableId + " border='1'><tr></tr></table>"));

				for (var tt = 0; tt < obj.CurrentResult.RawDataResults[pp].PerformanceStatistics[mm].Headers.length; tt++) {

					$('#' + tableId + ' > tbody > tr').append("<td class='performanceStatsHeaderCells' id=pshcelln" + tt + " valign='top'>"
						+ obj.CurrentResult.RawDataResults[pp].PerformanceStatistics[mm].Headers[tt] + "</td>");

				}


				//Stats body
				for (var tt = 0; tt < obj.CurrentResult.RawDataResults[pp].PerformanceStatistics[mm].StatsLog.length; tt++) {

					var createdTemp = "rown" + tt;
					var createdId = "id=" + createdTemp;

					$('#' + tableId).append("<tr " + createdId + "></tr>");


					for (var rr = 0; rr < obj.CurrentResult.RawDataResults[pp].PerformanceStatistics[mm].StatsLog[tt].length; rr++) {

						$('#' + tableId + ' > tbody > #' + createdTemp).append("<td class='performanceStatsCells' id=pscelln" + tt + " valign='top'>"
							+ obj.CurrentResult.RawDataResults[pp].PerformanceStatistics[mm].StatsLog[tt][rr] + "</td>");
					}
				}


			}
		}
	},
		widgetPlacer: function (index, total, markup) {

		var remaining = total - index;
		var remainder = index % 2;

		var nthPos = index;

		var width = '50%';
		if (remaining == 1) {
			width = '100%';
		}


		if (index == 0) {
			if (remaining > 1) {
				$("#tableCanvas").append($("<tr><td style='top:0px' width='50%' id=celln" + index + " >" + markup + "</td></tr>"));
			}
			else {
				$("#tableCanvas").append($("<tr><td style='top:0px' width='100%' id=celln" + index + " >" + markup + "</td></tr>"));
			}
		}
		else {
			if (remaining > 1) {
				$("<td style='top:0px' id=celln" + index + " width='100%'>" + markup + "</td>").appendTo($("#tableCanvas tr:nth-child(" + nthPos + ")"));
			}
			else {
				$("<td style='top:0px' id=celln" + index + " width='50%'>" + markup + "</td>").appendTo($("#tableCanvas tr:nth-child(" + nthPos + ")"));
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
				$("#tableCanvas").append($("<tr><td style='top:0px' width='50%' id=celln" + index + " valign='top'>" + markup + "</td></tr>"));

			}
			else {
				$("#tableCanvas").append($("<tr><td colspan='2' style='top:0px' width='100%' id=celln" + index + " valign='top'>" + markup + "</td></tr>"));
			}
		}
		else {
			// $("#tableCanvas  > tbody > tr > td").eq(nthPos).after("<td style='top:0px' id=celln" + index + " width='100%' valign='top'>" + markup + "</td>");

			var indset = index - 1;
			var newId = "#celln" + indset;

			$("#tableCanvas  > tbody > tr > " + newId).eq(nthPos).after("<td style='top:0px' id=celln" + index + " width='100%' valign='top'>" + markup + "</td>");

			//$("#tableCanvas  > tbody > tr > td").eq(nthPos).after("<td style='top:0px' id=celln" + index + " width='100%' valign='top'>" + markup + "</td>");
		}
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
		initalizeSubWidgets: function (presentationTypes, index, obj, dataLookUp, arraySeries, overlayArray, groupingUnits, yAxisArray, iter) {

		this.prepareChartData(presentationTypes, index, obj, dataLookUp, arraySeries, overlayArray, groupingUnits, yAxisArray, iter);
	},
		/**
		 * convert numeric key
		 * @param selectChartKey
		 * @returns {number}
		 */
		convertToNumericKeyID:function (selectChartKey){
		var accumulated = "";
		var total = 0;
		for (var i = 0; i < selectChartKey.length; i++)
		{
			var n = selectChartKey.charCodeAt(i);
			accumulated = accumulated + n;
			total = total + n;
		}
		return total;
	},


		displaySummary: function (presentationTypes, presentationTypeIndex, obj, dataLookUp, arraySeries, overlayArray, groupingUnits, yAxisArray) {

	},

	prepareChartData:function(presentationTypes, presentationTypeIndex, obj, dataLookUp, arraySeries, overlayArray, groupingUnits, yAxisArray, iter) {
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

					$('<br/>' + final).appendTo($("#celln"+ presentationTypeIndex));


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

					self.generateSummary(obj, presentationTypeIndex);
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

					self.generateSummary(obj, presentationTypeIndex);
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

					self.generateSummary(obj, presentationTypeIndex);

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

					self.generateSummary(obj, presentationTypeIndex);

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

					self.generateSummary(obj, presentationTypeIndex);
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


					self.generateSummary(obj, presentationTypeIndex);


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

	generateSummary:function(obj, presentationTypeIndex) {

		var genTabStr = "<table cellpadding='8' cellspacing='20'><tr><td style='border-left: 1px solid grey;'>";
		genTabStr += "<span style='color:#3a89ff;'><strong>Price Movement Facts: </strong></span><br/> <br/>"
		genTabStr += "<table cellpadding='8' cellspacing='8' border='1' style='border-color:#E0E0E0;'>";

		/*var genTabStr = "<div style='width: 300px;'>";
		 genTabStr += "<div style='float: left; width: 200px;'>";
		 genTabStr += '<span style="color:#3a89ff;">Price Movement Facts: </span><br/> <br/><table cellpadding="12" cellspacing="12" border="1" style="border-color:#E0E0E0;">';*/


		for (var bb = 0; bb < obj.CurrentResult.ProcessedResults.KeyFieldIndex[presentationTypeIndex].length; bb++) {

			var selectingIndex = obj.CurrentResult.ProcessedResults.KeyFieldIndex[presentationTypeIndex][bb];

			genTabStr += '<tr style="border-color:#E0E0E0;"><td>' + obj.CurrentResult.ProcessedResults.Headers[selectingIndex] + '</td><td>'
				+ obj.CurrentResult.ProcessedResults.ComputedResults[0][selectingIndex] + '</td></tr>';
			//+ obj.CurrentResult.ProcessedResults.ComputedResults[presentationTypeIndex][selectingIndex] + '</td></tr>';
		}


		genTabStr += "</table></td>";
		genTabStr += "<td valign='top' style='border-left: 1px solid grey; border-right: 1px solid grey;'><div style='margin-left:10px;margin-right:10px;'><span style='color:#3a89ff;'><strong>Summary:</strong> </span><br/> <br/>";
		genTabStr += obj.CurrentResult.RawDataResults[presentationTypeIndex].Summaries[0];
		genTabStr += "</div></td></tr></table>";
		//genTabStr += "This contains the text that explains or summaries the clients data.</div></td></tr></table>";

		var final = genTabStr;


		$('<br/>' + final).appendTo($("#celln" + presentationTypeIndex));
	},


	selectMiniChart:function (presentationTypeIndex, obj, highlighterArray, dataLookUp, arraySeries, overlayArray, yAxisArray) {

		var chartClassName = 'chartspace dialogchart' + presentationTypeIndex;

		var classOnly = '.dialogchart' + presentationTypeIndex;

		var dataPrep = [];
		var d, datePoint;


		var dataResultsT = dataLookUp["RAW"];

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

				var buttonSetup = { selected: 1 };

				if (bIntradayChart) {
					var buttonsArray = [{
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
						}, {
							type: 'all',
							count: 1,
							text: 'All'
						}];

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
				$(classOnly).highcharts('StockChart', {

					title: {
						text: symbolNames[0]
					},
					rangeSelector: buttonSetup,

					yAxis: yAxisArray,

					series: arraySeries,

					highlighted: true,
					highlightRegion: highlighterArray,

					overlay: overlayArray

				});

				this.$el.append()
			}
		}


		for (var iterItem = 0; iterItem < Highcharts.charts.length; iterItem++) {

			if (Highcharts.charts[iterItem] != null && Highcharts.charts[iterItem]!== undefined) {
				Highcharts.charts[iterItem].highlighted = true;
				Highcharts.charts[iterItem].redraw();
			}
		}


	}





	});

	return TradeRiserComponent;
});