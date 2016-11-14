var Highcharts = require('highcharts/highstock');
var $ = require('jquery');

var settings = require('./infrastructure/settings');

$(function () {
//    $.getJSON('https://www.highcharts.com/samples/data/jsonp.php?a=e&filename=aapl-ohlc.json&callback=?', function (data) {
$.getJSON(settings.withQuoteAPIBase('/daily/^BSESN?chartType=ohlc&callback=?'), function (raw) {
var data = raw.quotes;

        // create the chart
        var chart = Highcharts.StockChart('testchart',  {
                rangeSelector : {
                    selected : 4,
                    buttons: [{
                        type: 'month',
                        count: 1,
                        text: '1m'
                    }, {
                        type: 'month',
                        count: 3,
                        text: '3m'
                    }, {
                        type: 'month',
                        count: 6,
                        text: '6m'
                    }, {
                        type: 'ytd',
                        text: 'YTD'
                    }, {
                        type: 'year',
                        count: 1,
                        text: '1y'
                    }, {
                        type: 'all',
                        text: 'All'
                    }]
                },
                title: {
                    text: ''
                },
                tooltip: {
                    //pointFormat: require('../templates/highchartPointFormat.html'),
                    xDateFormat: '%Y-%m-%d',
                    valueDecimals: 2
                },
                series : [{
                    type: 'candlestick',
                    //turboThreshold: 0,
                    id: 'main',
                    dataGrouping: {
                        units: [
                            [
                                'day', // unit name
                                [1] // allowed multiples
                            ], 
                            [
                                'week', // unit name
                                [1] // allowed multiples
                            ], [
                                'month',
                                [1, 2, 3, 4, 6]
                            ]
                        ],
                        dateTimeLabelFormats: {
                           day: ['%Y-%m-%d', '%A, %b %e', '-%A, %b %e, %Y'],
                           week: ['Week @ %Y-%m-%d', '%A, %b %e', '-%A, %b %e, %Y'],
                           month: ['%B %Y', '%B', '-%B %Y']
                        }
                    }
                }]
            });

        var series = chart.get('main');
        series.setData(data, false);
        series.name = 'nytt namn';

        chart.setTitle( { text: ' hej Stock Price' } );
        chart.redraw();

    });
});
