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
                    selected : 4
                },
                title : {
                },
                plotOptions: {
                    series: {
                        compare: 'percent'
                    }
                },
                yAxis: {
                    labels: {
                        formatter: function () {
                            return (this.value > 0 ? ' + ' : '') + this.value + '%';
                        }
                    },
                    //plotLines: [{
                    //    value: 0,
                    //    width: 2,
                    //    color: 'silver'
                    //}]
                },
                series : [{
                    //type: 'candlestick',
                    //type: 'ohlc',
                    type: 'line',
                    turboThreshold: 0,
                    id : 'main',
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

                self.addYValue(data);

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
                self.addYValue(data);

                return {
                    type: 'line',
                    //type: 'ohlc',
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

        this.addYValue = function(data) {
            _.each(data.quotes, function(quote) { 
                quote.y = quote.close;
            });
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

        self = this;

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
