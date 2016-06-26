var Highcharts = require('highcharts/highstock');
var $ = require('jquery');
var ko = require('knockout');

ko.components.register('chart', {
    viewModel: function(params) {
        if(!params.symbol) {
            throw 'Must supply symbol';
        }

        this.symbol = params.symbol;

        // Create the chart
        //$.getJSON('https://www.highcharts.com/samples/data/jsonp.php?filename=aapl-c.json&callback=?', function (data) {
        this.url = 'http://localhost:3000/daily/{symbol}?chartType=ohlc&callback=?'
            .replace('{symbol}', this.symbol);

        $.getJSON(this.url, function (data) {
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

    },
    template: require('../templates/chart.html')
});
