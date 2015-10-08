(function(H) {
    H.wrap(H.Chart.prototype, 'init', function(origFunc) {
        this.highlightedRegions = [];
        this.pins = [];
        this.pinsConf = {
            width: 20,
            height: 30
        };
        var chart = this;

        function removeSpeechBubbles() {
            $('#speech-bubble').remove();
            $('#speech-bubble-pointer').remove();
        }

        function openSpeechBubble(content, pinLeft, pinTop) {
            $("#speech-bubble").remove();
            $("#speech-bubble-pointer").remove();
            var speechBubble = '' + '<div id="speech-bubble" style="display:none;">' + '<div class="container">' + '<div class="close-bar"><div class="close">X</div></div>' + '<br/><div class="bubblecontent">' + content + '</div>' + '</div>' + '</div>';
            $(chart.container).prepend(speechBubble);
            $("#speech-bubble .close").click(removeSpeechBubbles);
            var w = $("#speech-bubble").outerWidth();
            var h = $("#speech-bubble").outerHeight();
            var bubbleLeft = pinLeft + (chart.pinsConf.width / 2) - (w / 2);
            var bubbleTop = pinTop - h - 15;
            var containerWidth = $(chart.container).width();
            if (bubbleLeft + w > containerWidth) {
                bubbleLeft = containerWidth - w - 10;
            }
            if (bubbleLeft < 0) {
                bubbleLeft = 10;
            }
            if (bubbleTop <= 0) {
                bubbleTop = 2;
            }
            $("#speech-bubble").css({
                left: bubbleLeft + "px",
                top: bubbleTop + "px",
                display: ""
            });
            // draw pointer
            chart.renderer.path(['M', pinLeft + (chart.pinsConf.width / 2), pinTop + 9, 'L', bubbleLeft + (w / 2) - 10, bubbleTop + h - 1, 'M', bubbleLeft + (w / 2) + 10, bubbleTop + h - 1, 'L', pinLeft + (chart.pinsConf.width / 2), pinTop + 9]).attr({
                'stroke-width': 1,
                stroke: '#000000',
                id: 'speech-bubble-pointer',
                zIndex: 10
            }).add();
        }

        function createOnClick(content, x, y) {
            return function f() {
                openSpeechBubble(content, x, y);
            };
        }
        this.highlightRegions = function() {
            // console.log("obj");
            removeSpeechBubbles();
            if (!chart.options.highlightRegion || !chart.options.highlightRegion.length) {
                return;
            }
            // remove existing highlighted regions
            H.each(chart.highlightedRegions, function(h) {
                h.destroy();
            })
            chart.highlightedRegions = [];
            // remove existing pins
            H.each(chart.pins, function(pin) {
                pin.remove();
            })
            chart.pins = [];
            if (this.highlighted) {
                var yAxisVol = chart.yAxis[1];
                // console.log(yAxisVol);
                var xAxisMain = chart.xAxis[0];
                var serieVol = yAxisVol.series[0];
                var pointsVol = serieVol.points;
                var regions = [];
                H.each(chart.options.highlightRegion, function(region) {
                    yAxisVol = chart.yAxis[region.axisIndex];
                    // console.log(region);
                    serieVol = region.seriesIndex ? yAxisVol.series[region.seriesIndex] : yAxisVol.series[0];
                    pointsVol = serieVol.points;
                    // console.log(serieVol, pointsVol);
                    region.points = [];
                    H.each(pointsVol, function(point) {
                        if (point.x >= region.startDate && point.x <= region.endDate) {
                            region.points.push({
                                x: xAxisMain.toPixels(point.x),
                                y: yAxisVol.toPixels(point.y),
                                height: (serieVol.type == 'line' ? 0 : point.shapeArgs.height),
                                width: (serieVol.type == 'line' ? 0 : point.shapeArgs.width)
                            });
                        }
                    });
                    regions.push(region);
                });
                var xFrom, xTo, yFrom, yTo, x, y, w, h, xFromVol, xToVol, volMaxHeight, r = 10;
                H.each(regions, function(region) {
                    yAxisVol = chart.yAxis[region.axisIndex];
                    // console.log(region);
                    serieVol = region.seriesIndex ? yAxisVol.series[region.seriesIndex] : yAxisVol.series[0];
                    if (region.points.length == 0) {
                        return true; // continue
                    }
                    xFrom = region.points[0].x - region.points[0].width;
                    xFrom = Math.max(xFrom, xAxisMain.left);
                    xTo = region.points[region.points.length - 1].x + region.points[region.points.length - 1].width;
                    volMaxHeight = region.points[0].height;
                    yFrom = region.points[0].y;
                    yTo = region.points[0].y + region.points[0].height;
                    if (serieVol.type == "column") {
                        H.each(region.points, function(point) {
                            if (point.height > volMaxHeight) {
                                volMaxHeight = point.height;
                            }
                        });
                        x = xFromVol;
                        y = (yAxisVol.top + yAxisVol.height) - volMaxHeight - 5;
                        w = xToVol - xFromVol;
                        h = volMaxHeight + 10;
                        var elmVol = chart.renderer.rect(x, y, w, h, 4).attr({
                            'stroke-width': 0.2,
                            stroke: 'black',
                            zIndex: 0,
                            fill: region.colour || '#e1f5e4'
                        });
                        elmVol.add();
                        chart.highlightedRegions.push(elm);
                        var pinDiv, pinElm, pinLeft, pinTop;
                        if (region.speechBubbleHtml) {
                            pinLeft = (x + (w / 2) - (chart.pinsConf.width / 2));
                            pinTop = (y - chart.pinsConf.height);
                            pinDiv = '<div class="pin" style="left:' + pinLeft + 'px; top:' + pinTop + 'px""></div>';
                            pinElm = $(pinDiv);
                            $(chart.container).prepend(pinElm);
                            pinElm.click(createOnClick(region.speechBubbleHtml, pinLeft, pinTop));
                            chart.pins.push(pinElm);
                        }
                    } else if (serieVol.type == "line" || serieVol.type == "candlestick") {
                        H.each(region.points, function(point) {
                            if (point.y < yFrom) {
                                yFrom = point.y;
                            }
                            if (point.y + point.height > yTo) {
                                yTo = point.y + point.height;
                            }
                        });
                        x = xFrom;
                        y = yFrom - 5;
                        w = xTo - xFrom;
                        // h = serieVol.type=="line"? yFrom+10 :(yTo - yFrom) + 10;
                        h = (yTo - yFrom) + 10;
                        if (serieVol.type == "line" && w == 0) {
                            w = 15;
                        }
                        var elm = chart.renderer.rect(xFrom, yFrom - 5, w, h, 4).attr({
                            'stroke-width': 0.2,
                            stroke: 'black',
                            zIndex: 1,
                            /*'opacity':0.5,*/
                            fill: region.colour || '#e1f5e4'
                        });
                        chart.highlightedRegions.push(elm);
                        elm.add();
                        var pinDiv, pinElm, pinLeft, pinTop;
                        if (region.speechBubbleHtml) {
                            pinLeft = (x + (w / 2) - (chart.pinsConf.width / 2));
                            pinTop = (y - chart.pinsConf.height);
                            pinDiv = '<div class="pin" style="left:' + pinLeft + 'px; top:' + pinTop + 'px""></div>';
                            pinElm = $(pinDiv);
                            $(chart.container).prepend(pinElm);
                            pinElm.click(createOnClick(region.speechBubbleHtml, pinLeft, pinTop));
                            chart.pins.push(pinElm);
                        }
                    }
                });
            }
        };
        this.buildOverlay = function() {
            var chart = this;
            if (!chart.options.overlay || !chart.options.overlay.length) {
                return;
            }
            H.each(chart.options.overlay, function(overlay) {
                H.each(overlay.data, function(d) {
                    var options = {
                        name: overlay.name,
                        data: d,
                        lineWidth: 1,
                        marker: {
                            symbol: 'circle',
                            states: {
                                hover: {
                                    enabled: false
                                }
                            }
                        }
                    }
                    if (overlay.color) {
                        options.color = overlay.color;
                    }
                    if (overlay.dataGrouping) {
                        options.dataGrouping = overlay.dataGrouping;
                    }
                    chart.addSeries(options);
                });
            });
        };
        this.addTrendLines = function (argument) {
            if (!chart.options.trendLines || !chart.options.trendLines.length) {
                return;
            }
            H.each(chart.options.trendLines,function (trendline) {
                var yAxis = chart.yAxis[0];
                var axisSeries = yAxis.series[0];
                var axisPoints = axisSeries.points;
                var lineDataLow = [];
                var lineDataHigh = [];
                // console.log(axisPoints);
                H.each(axisPoints, function(point) {

                        if (point.x == trendline.startDate || point.x == trendline.endDate) {
                            lineDataLow.push([point.x,point.low]);
                            lineDataHigh.push([point.x,point.high]);
                        }
                });
                console.log(lineDataLow,lineDataHigh);
                var options = {
                        name: trendline.name + " - High ",
                        data: lineDataHigh,
                        lineWidth: 2,
                        marker: {
                            symbol: 'circle',
                            states: {
                                hover: {
                                    enabled: false
                                }
                            }
                        }
                    };
                    if (trendline.highColor) {
                        options.color = trendline.highColor;
                    }
                    if (trendline.dataGrouping) {
                        options.dataGrouping = trendline.dataGrouping;
                    }
                    chart.addSeries(options);
                    var options2 = {
                        name: trendline.name + " - Low ",
                        data: lineDataLow,
                        lineWidth: 2,
                        marker: {
                            symbol: 'circle',
                            states: {
                                hover: {
                                    enabled: false
                                }
                            }
                        }
                    };
                    if (trendline.highColor) {
                        options.color = trendline.lowColor;
                    }
                    if (trendline.dataGrouping) {
                        options.dataGrouping = trendline.dataGrouping;
                    }
                    chart.addSeries(options2);

            });

        }
        origFunc.apply(this, Array.prototype.slice.call(arguments, 1));
    });
    H.wrap(H.Chart.prototype, 'render', function(origFunc) {
        origFunc.apply(this, Array.prototype.slice.call(arguments, 1));
        this.highlightRegions();
        this.addTrendLines();
        this.buildOverlay();
    });
    H.wrap(H.Chart.prototype, 'redraw', function(origFunc) {
        origFunc.apply(this, Array.prototype.slice.call(arguments, 1));
        this.highlightRegions();
    });
}(Highcharts));