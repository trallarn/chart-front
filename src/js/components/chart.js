var Highcharts = require('highcharts/highstock');
var $ = require('jquery');
var ko = require('knockout');
var _ = require('underscore');

ko.components.register('chart', {

    viewModel: function(params) {

        self = this;

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
                    }
                },
                series : [{
                    type: 'candlestick',
                    //type: 'ohlc',
                    //type: 'line',
                    turboThreshold: 0,
                    id: 'main',
                    tooltip: {
                        valueDecimals: 2
                    }
                }]
            });
        };

        this.getMainSerie = function() {
            return self.chart.get('main');
        };

        this.updateChartWithMainSeries = function(symbol) {

            var url = this.dailyQuotesUrl
                .replace('{symbol}', symbol);

            $.getJSON(url, function (data) {

                self.addYValue(data);

                self.getMainSerie().setData(data.quotes);

                self.chart.setTitle(data.symbol + ' Stock Price');

                self.chart.redraw();

            });
        };

        this.toComparisonId = function(symbol) {
            return 'comp-' + symbol;
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
                    id: self.toComparisonId(data.symbol),
                    turboThreshold: 0,
                    data : data.quotes,
                    tooltip: {
                        valueDecimals: 2
                    }
                };
            });

            _.each(comparedSeries, function(series) {
                var s = self.chart.addSeries(series, false);
            });

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
                        self.setCompareChart();
                    }
                }.bind(this));

            }.bind(this));

            // Remove uncompared series
            var seriesToRemove = _.filter(self.chart.series, function(serie) {
                return !serie.options.isInternal && serie.options.id !== 'main' && !_.find(instruments, function(instrument) {
                    return self.toComparisonId(instrument.symbol) === serie.options.id;
                });
            });

            _.each(seriesToRemove, function(serie) {
                serie.remove(false);
            });


            if(instruments.length === 0) {
                self.setNoCompareChart();
            }
        };

        this.setCompareChart = function() {
            var y = self.chart.yAxis[0];
            y.setCompare('percent');
            y.update({
                labels: {
                    formatter: function () {
                        return (this.value > 0 ? ' + ' : '') + this.value + '%';
                    }
                }
            });
            self.getMainSerie().update({type: 'line'});
        };

        this.setNoCompareChart = function() {
            var y = self.chart.yAxis[0];
            y.setCompare();
            y.update({
                labels: {
                    formatter: function () {
                        return this.value;
                    }
                }
            });
            self.getMainSerie().update({type: 'candlestick'});
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
