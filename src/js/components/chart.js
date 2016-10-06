var Highcharts = require('highcharts/highstock');
var $ = require('jquery');
var ko = require('knockout');
var _ = require('underscore');
var PubSub = require('pubsub-js');

var stateRW = require('../infrastructure/StateRW');

ko.components.register('chart', {

    viewModel: function(params) {

        self = this;

        this.stateId = 'chart';

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
                tooltip: {
                    pointFormat: require('../templates/highchartPointFormat.html'),
                    valueDecimals: 2
                },
                series : [{
                    type: 'candlestick',
                    turboThreshold: 0,
                    id: 'main',
                    tooltip: {
                        valueDecimals: 2
                    },
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
                        ]
                    }
                }]
            });
        };

        this.getMainSerie = function() {
            return self.chart.get('main');
        };

        this.updateChartWithMainSeries = function(symbol, refreshData) {

            var url = this.dailyQuotesUrl
                .replace('{symbol}', symbol);

            if(refreshData) {
                url += '&refreshData=1';
            }

            $.getJSON(url, function (data) {

                self.addYValue(data);

                self.getMainSerie().setData(data.quotes);
                self.getMainSerie().name = data.symbol;

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
                    name: data.symbol,
                    turboThreshold: 0,
                    data : data.quotes,
                    tooltip: {
                        valueDecimals: 2
                    }
                };
            });

            _.each(comparedSeries, function(series) {
                var s = self.chart.addSeries(series);
            });

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
            self.getMainSerie().update({ type: 'line' });

            var y = self.chart.yAxis[0];
            y.setCompare('percent');
            y.update({
                labels: {
                    formatter: function () {
                        return (this.value > 0 ? ' + ' : '') + this.value + '%';
                    }
                }
            });

        };

        this.setNoCompareChart = function() {
            self.getMainSerie().update({type: 'candlestick'});

            var y = self.chart.yAxis[0];
            y.setCompare();
            y.update({
                labels: {
                    formatter: function () {
                        return this.value;
                    }
                }
            });
        };

        this.refreshData = function() {
            this.updateChartWithMainSeries(params.chartedInstrument().symbol, true);
        };

        /**
         * Sets the x-axis range.
         */
        this.setXRange = function(msg, data) {
            var xAxises = self.chart.xAxis;
            var redraw = true;
            xAxises[0].setExtremes(data.from.getTime(), data.to.getTime(), redraw);
        };

        self.saveState = function() {
            stateRW.save(self.stateId, {
                main: self.chartedInstrument().symbol
            });
        };

        self.loadState = function() {
            var state = stateRW.read(self.stateId);
            
            if(state) {
                self.chartedInstrument( {
                    symbol: state.main
                });
            }
        };

        if(!params.chartedInstrument) {
            throw 'Must supply chartedInstrument';
        }

        if(!params.comparedInstruments) {
            throw 'Must supply comparedInstrument';
        }

        self.chartedInstrument = params.chartedInstrument;
        self.comparedInstruments = params.comparedInstruments;

        self.chartedInstrument.subscribe(function(val){
            self.updateChartWithMainSeries(val.symbol);
            self.saveState();
        });

        self.comparedInstruments.subscribe(function(){
            self.updateChartWithComparedSeries(params.comparedInstruments());
        });

        PubSub.subscribe('chart/setXRange', this.setXRange);

        this.createChart();
        this.loadState();

    },
    template: require('../templates/chart.html')
});
