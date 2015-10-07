// JavaScript Document
function DisplaySummary(presentationTypes, presentationTypeIndex, obj, dataLookUp, arraySeries, overlayArray, groupingUnits, yAxisArray) {

}

function PrepareChartData(presentationTypes, presentationTypeIndex, obj, dataLookUp, arraySeries, overlayArray, groupingUnits, yAxisArray, iter) {

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

                        GenerateSummary(obj, presentationTypeIndex);
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

                        GenerateSummary(obj, presentationTypeIndex);
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

                        GenerateSummary(obj, presentationTypeIndex);

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

                        GenerateSummary(obj, presentationTypeIndex);

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

                        GenerateSummary(obj, presentationTypeIndex);
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


                        GenerateSummary(obj, presentationTypeIndex);


                        bSubWidgetSet = true;

                        allCountIter++;
                    }
                    break;
            }
        }

        //if (bSubWidgetSet === true) {
        //    $("#resultCanvas").append($('<br/><hr style="border: 0; color: #9E9E9E; background-color: #9E9E9E; height: 1px; width: 100%; text-align: left;" />'));
        //}
}

function GenerateSummary(obj, presentationTypeIndex) {

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
}