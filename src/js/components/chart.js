var Highcharts = require('highcharts/highstock');
var $ = require('jquery');
var ko = require('knockout');
var _ = require('underscore');

ko.components.register('chart', {

    viewModel: function(params) {
        if(!params.chartedInstrument) {
            throw 'Must supply chartedInstrument';
        }

        params.chartedInstrument.subscribe(function(val){
            updateChart(val.symbol);
        });

        /**
         * Creates the highstock-chart without data.
         */
        var createChart = function() {
            self.chart = Highcharts.StockChart('chart',  {
                rangeSelector : {
                    selected : 1
                },
                title : {
                },
                series : [{
                    type: 'candlestick',
                    //type: 'line',
                    turboThreshold: 0,
                    id : 'main',
                    //data : data.quotes,
                    tooltip: {
                        valueDecimals: 2
                    }
                }]
            });
        };

        var updateChart = function(symbol) {

            // Create the chart
            //$.getJSON('https://www.highcharts.com/samples/data/jsonp.php?filename=aapl-c.json&callback=?', function (data) {
            this.url = 'http://localhost:3000/daily/{symbol}?chartType=ohlc&callback=?'
                .replace('{symbol}', symbol);

            $.getJSON(this.url, function (data) {

                var mainSerie = self.chart.get('main');
                mainSerie.setData(data.quotes);

                self.chart.setTitle(data.symbol + ' Stock Price');

                self.chart.redraw();

            });
        };

        createChart();

    },
    template: require('../templates/chart.html')
});
