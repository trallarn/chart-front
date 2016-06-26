var Highcharts = require('highcharts/highstock');
var $ = require('jquery');

// Create the chart
//$.getJSON('https://www.highcharts.com/samples/data/jsonp.php?filename=aapl-c.json&callback=?', function (data) {
$.getJSON('http://localhost:3000/daily/AAK.ST?chartType=ohlc&callback=?', function (data) {
    Highcharts.StockChart('chart',  {
        rangeSelector : {
            selected : 1
        },

        title : {
            text : data.symbol + ' Stock Price'
        },

        series : [{
            type: 'candlestick',
            //type: 'line',
            name : data.symbol,
            data : data.quotes,
            tooltip: {
                valueDecimals: 2
            }
        }]
    });
});

