var Highcharts = require('highcharts/highstock');
var $ = require('jquery');
var ko = require('knockout');

ko.components.register('chart', {
    viewModel: function(params) {
        if(!params.chartedInstrument) {
            throw 'Must supply chartedInstrument';
        }

        params.chartedInstrument.subscribe(function(val){
            updateChart(val.symbol);
        });

        var updateChart = function(symbol) {

            // Create the chart
            //$.getJSON('https://www.highcharts.com/samples/data/jsonp.php?filename=aapl-c.json&callback=?', function (data) {
            this.url = 'http://localhost:3000/daily/{symbol}?chartType=ohlc&callback=?'
                .replace('{symbol}', symbol);

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
                        turboThreshold: 0,
                        name : data.symbol,
                        data : data.quotes,
                        tooltip: {
                            valueDecimals: 2
                        }
                    }]
                });
            });
        };

    },
    template: require('../templates/chart.html')
});
