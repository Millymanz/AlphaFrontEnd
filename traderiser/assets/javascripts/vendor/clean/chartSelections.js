// JavaScript Document


function SelectMiniChart(presentationTypeIndex, obj, highlighterArray, dataLookUp, arraySeries, overlayArray, yAxisArray) {

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
        }
    }


    for (var iterItem = 0; iterItem < Highcharts.charts.length; iterItem++) {

        if (Highcharts.charts[iterItem] != null && Highcharts.charts[iterItem]!== undefined) {
                Highcharts.charts[iterItem].highlighted = true;
                Highcharts.charts[iterItem].redraw();
        }
    }  


}























