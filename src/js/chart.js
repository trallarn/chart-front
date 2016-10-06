var Highcharts = require('highcharts/highstock');
var $ = require('jquery');

$(function () {
//    $.getJSON('https://www.highcharts.com/samples/data/jsonp.php?a=e&filename=aapl-ohlc.json&callback=?', function (data) {
$.getJSON('http://localhost:3000/daily/AAK.ST?chartType=ohlc&callback=?', function (raw) {
var data = raw.quotes;

        // create the chart
        Highcharts.StockChart('testchart',  {


            rangeSelector: {
                selected: 1
            },

            title: {
                text: 'AAPL Stock Price'
            },

            series: [{
                type: 'candlestick',
                name: 'AAPL Stock Price',
                data: data,
                turboThreshold: 0,
                dataGrouping: {
                    units: [
                        [
                            'week', // unit name
                            [1] // allowed multiples
                        ], [
                            'month',
                            [1, 2, 3, 4, 6]
                        ]
                    ]
                }
            }]
        });
    });
});
//$.getJSON('http://localhost:3000/daily/AAK.ST?chartType=ohlc&callback=?', function (data) {
//    Highcharts.StockChart('testchart',  {
//        rangeSelector : {
//            selected : 1
//        },
//        plotOptions: {
//            candlestick: {
//                lineColor: '#2f7ed8',
//                upLineColor: 'silver', // docs
//                upColor: 'silver'
//            }
//        },
//
//        title : {
//            text : data.symbol + ' Stock Price'
//        },
//
//        series : [{
//            type: 'candlestick',
//            //type: 'line',
//            turboThreshold: 0,
//            name : data.symbol,
//            data : data.quotes,
//            tooltip: {
//                valueDecimals: 2
//            }
//        }]
//    });
//});

