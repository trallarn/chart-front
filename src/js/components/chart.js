var Highcharts = require('highcharts/highstock');
var $ = require('jquery');
var ko = require('knockout');
var _ = require('underscore');
var PubSub = require('pubsub-js');
var moment = require('moment');

var stateRW = require('../infrastructure/StateRW');
var settings = require('../infrastructure/settings');
var InstrumentsAPI = require('../api/InstrumentsAPI');
var instrumentsAPI = new InstrumentsAPI();

ko.components.register('chart', {

    viewModel: function(params) {

        var self = this;

        this.stateId = 'chart';

        this.dailyQuotesUrl = settings.withQuoteAPIBase('/daily/{symbol}?chartType=ohlc&callback=?');

        /**
         * Creates the highstock-chart without data.
         */
        this.createChart = function() {
            self.chart = Highcharts.StockChart('chart',  {
                yAxis: {
                    type: 'linear'
                },
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


                self.removeExtremas();

                self.getMainSerie().setData(data.quotes, false);
                self.getMainSerie().name = data.symbol;

                self.chart.setTitle( { text: data.symbol + ' Stock Price' } );

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

                return {
                    type: 'line',
                    //type: 'ohlc',
                    id: self.toComparisonId(data.symbol),
                    name: data.symbol,
                    //turboThreshold: 0,
                    data : data.quotes,
                    tooltip: {
                        valueDecimals: 2
                    }
                };
            });

            _.each(comparedSeries, function(series) {
                var s = self.chart.addSeries(series, false, false);
            });

            //self.chart.redraw();
        };

        this.updateChartWithComparedSeries = function(instruments) {

            var count = 0;
            var datas = [];

            var toAdd = _.reject(instruments, function(instrument) {
                return self.chart.get(self.toComparisonId(instrument.symbol));
            });

            _.each(toAdd, function(instrument) {
                var url = this.dailyQuotesUrl
                    .replace('{symbol}', instrument.symbol);

                $.getJSON(url, function(data) {
                    datas.push(data);
                    count++;

                    if(count === toAdd.length) {
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

        /**
         * Updates the main series, keeps properties like 'name'.
         */
        this.updateMainSerie = function(options) {
            var mainSerie = self.getMainSerie();

            options = _.extend({ name: mainSerie.name }, options);
            mainSerie.update(options);
        };

        this.setCompareChart = function() {
            self.updateMainSerie({ type: 'line' });

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
            self.updateMainSerie({ type: 'candlestick' });

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

        this.addYPlotLine = function(data) {
            var axises = self.chart.yAxis;

            axises[0].addPlotLine({
                id: data.id,
                width: 2,
                color: data.color || 'black',
                label: data.label,
                value: data.value
            });
        };

        this.addXPlotLine = function(msg, data) {
            var xAxises = self.chart.xAxis;

            xAxises[0].addPlotLine({
                id: data.id,
                width: 2,
                color: data.color || 'black',
                label: data.label,
                value: data.value.getTime()
            });
        };

        this.removeXPlotLine = function(msg, data) {
            if(!data.id) {
                throw 'Must supply id';
            }

            var xAxises = self.chart.xAxis;

            xAxises[0].removePlotLine(data.id);
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

        self.removeExtremas = function() {
            _.each(self.yExtremasPlotLineIds, function(id) {
                self.chart.yAxis[0].removePlotLine(id);
            });
            _.each(self.xExtremasPlotLineIds, function(id) {
                self.chart.xAxis[0].removePlotLine(id);
            });

            self.yExtremasPlotLineIds = [];
            self.xExtremasPlotLineIds = [];

        };

        self.showExtremas = function() {
            if(self.yExtremasPlotLineIds.length > 0) {
                self.removeExtremas();
            }

            var agoParams = self.extremasSettings.extremeAgoInput().split(' ');

            var data = {
                ttls: self.extremasSettings.extremeWildInput()
                ,from: moment().subtract(agoParams[0], agoParams[1]).valueOf()
            };

            instrumentsAPI.getExtremas(self.getMainSerie().name, data)
                .then(function(data) {

                    _.each(data, function(ttlData) {
                        var extremes = [].concat(ttlData.maxs)
                            .concat(ttlData.mins);

                        _.each(extremes, function(extrema) {
                            var id = 'extrema-' + Math.random();
                            self.addYPlotLine({
                                value: extrema[1],
                                id: id,
                                label: {
                                    text: ttlData.ttl
                                }
                            });

                            self.yExtremasPlotLineIds.push(id);
                        });

                        var xPlotFeed = [
                            {
                                extremes: ttlData.maxs,
                                color: 'red'
                            },
                            {
                                extremes: ttlData.mins,
                                color: 'green'
                            }
                        ];

                        _.each(xPlotFeed, function(feed) {
                            _.each(feed.extremes, function(extrema) {
                                var id = 'extrema-' + Math.random();
                                self.addXPlotLine('', {
                                    value: new Date(extrema[0]),
                                    color: feed.color,
                                    id: id,
                                    label: {
                                        text: ttlData.ttl
                                    }
                                });

                                self.xExtremasPlotLineIds.push(id);
                            });
                        });
                    }, this);

                });
        };

        self.toggleExtremas = function() {
            if(self.yExtremasPlotLineIds.length > 0) {
                self.removeExtremas();
                return;
            }

            self.showExtremas();
        };
        
        self.setLinearScale = function() {
            var yAxis = self.chart.yAxis[0];
            yAxis.update({ type: 'linear' });
        };

        self.setLogarithmicScale = function() {
            var yAxis = self.chart.yAxis[0];
            yAxis.update({ type: 'logarithmic' });
        };

        if(!params.chartedInstrument) {
            throw 'Must supply chartedInstrument';
        }

        if(!params.comparedInstruments) {
            throw 'Must supply comparedInstrument';
        }

        self.onExtremasSettingsLoad = function(extremasSettings) {
            self.extremasSettings = extremasSettings;

            self.extremasSettings.extremeWildInput.subscribe(_.debounce(self.showExtremas, 500));
            self.extremasSettings.extremeAgoInput.subscribe(self.showExtremas);
        };

        self.chartedInstrument = params.chartedInstrument;
        self.comparedInstruments = params.comparedInstruments;
        self.yExtremasPlotLineIds = [];
        self.xExtremasPlotLineIds = [];

        self.chartedInstrument.subscribe(function(val){
            self.updateChartWithMainSeries(val.symbol);
            self.saveState();
        });

        self.comparedInstruments.subscribe(function(){
            self.updateChartWithComparedSeries(params.comparedInstruments());
        });

        PubSub.subscribe('chart/setXRange', this.setXRange);
        PubSub.subscribe('chart/addXPlotLine', this.addXPlotLine);
        PubSub.subscribe('chart/removeXPlotLine', this.removeXPlotLine);

        this.createChart();
        this.loadState();

    },
    template: require('../templates/chart.html')
});
