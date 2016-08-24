var Highcharts = require('highcharts/highstock');
var $ = require('jquery');
var ko = require('knockout');
var _ = require('underscore');

ko.components.register('chart', {

    viewModel: function(params) {

        this.dailyQuotesUrl = 'http://localhost:3000/daily/{symbol}?chartType=ohlc&callback=?';

        /**
         * Creates the highstock-chart without data.
         */
        this.createChart = function() {
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

        this.updateChartWithMainSeries = function(symbol) {

            var url = this.dailyQuotesUrl
                .replace('{symbol}', symbol);

            $.getJSON(url, function (data) {

                var mainSerie = self.chart.get('main');
                mainSerie.setData(data.quotes);

                self.chart.setTitle(data.symbol + ' Stock Price');

                self.chart.redraw();

            });
        };

        /**
         * Adds compared series to the chart.
         */
        this.addComparisonData = function(datas) {
            var comparedSeries = _.map(datas, function(data) {
                return {
                    //type: 'line',
                    type: 'candlestick',
                    turboThreshold: 0,
                    data : data.quotes,
                    tooltip: {
                        valueDecimals: 2
                    }
                };
            });

            _.each(comparedSeries, function(series) {
                self.chart.addSeries(series, false);
            });

            //TODO MUST REMOVE OLD SERIES
            self.chart.redraw();
        };

        this.updateChartWithComparedSeries = function(instruments) {

            var count = 0;
            var datas = [];

            _.each(instruments, function(instrument) {
                var url = this.dailyQuotesUrl
                    .replace('{symbol}', instrument.symbol);

                $.getJSON(url, function(data) {
                    datas.push(data);
                    count++;

                    if(count === instruments.length) {
                        this.addComparisonData(datas);
                    }
                }.bind(this));

            }.bind(this));
        };

        if(!params.chartedInstrument) {
            throw 'Must supply chartedInstrument';
        }

        if(!params.comparedInstruments) {
            throw 'Must supply comparedInstrument';
        }

        params.chartedInstrument.subscribe(function(val){
            this.updateChartWithMainSeries(val.symbol);
        }.bind(this));

        params.comparedInstruments.subscribe(function(){
            this.updateChartWithComparedSeries(params.comparedInstruments());
        }.bind(this));

        this.createChart();

    },
    template: require('../templates/chart.html')
});
