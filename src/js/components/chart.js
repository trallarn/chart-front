var Highcharts = require('highcharts/highstock');
var $ = require('jquery');
var ko = require('knockout');
var _ = require('underscore');
var PubSub = require('pubsub-js');
var moment = require('moment');

var stateRW = require('../infrastructure/StateRW');
var settings = require('../infrastructure/settings');
var instrumentsAPI = require('../api/InstrumentsAPI');
var extremasAPI = require('../api/ExtremasAPI');

ko.components.register('chart', {

    viewModel: function(params) {

        var self = this;

        this.stateId = 'chart';
        this.quotesUrl = settings.withPyQuoteAPIBase('/{period}/{symbol}?chartType=ohlc&callback=?');
        this.taUrl = settings.withPyQuoteAPIBase('/technical-analysis/{period}/{symbol}?mas={mas}&callback=?');
        this.periods = ['daily','weekly','monthly'];
        this.selectedPeriod = ko.observable('daily');
        this.isFolded = ko.observable(false);

        this.isLoadingState = ko.observable(false);
        this.isLoadingStateSubscription = false;

        this.maSeriesIdPrefix = 'ma-';
        this.comparedSeriesIdPrefix = 'comp-';

        this.compareTypes = ['value', 'percent'];
        this.compareType = ko.observable('value');

        this.removePeaks = ko.observable(true);

        this.numYAxisSelections = ['1 yaxis', '2 yaxis'];
        this.numYAxis = ko.observable('1 axis');
        this.compareYAxisIndex = 0;

        /**
         * Update data series on change of period.
         */
        this.selectedPeriod.subscribe(val => {
            this.updateChartSeries();
        });

        this.compareType.subscribe(val => {
            this.setCompare(val);
        });

        this.numYAxis.subscribe(val => {
            let compareIdx = this.numYAxisSelections.indexOf(val);
            this.setCompareYAxis(compareIdx);
        });

        this.setCompareYAxis = idx => {
            self.compareYAxisIndex = idx;

            console.log(`setting num yaxis to ${idx}`);
            this.getComparedSeries().forEach(series => {
                series.update({
                    yAxis: self.compareYAxisIndex
                });
            });
        };

        /**
         * Updates chart series data. Saves state.
         */
        this.updateChartSeries = () => {
            this.updateComparedSeriesData();

            if(this.chartedInstrument()) {
                this.updateChartWithMainSeries(this.chartedInstrument().symbol);
            }

            this.saveState();
        };

        this.getMainSerie = function() {
            return self.chart.get('main');
        };

        this.urlWithPeriodAndSymbol = (url, symbol) => {
            return url
                .replace('{period}', this.selectedPeriod())
                .replace('{symbol}', symbol);
        };

        this.buildQuotesUrl = (symbol) => {
            let url = this.urlWithPeriodAndSymbol(this.quotesUrl, symbol);

            if(self.currencySelector) {

                var currency = self.currencySelector.selectedCurrency();

                if(currency) {
                    url += '&currency_symbol=' + currency.symbol;

                    var invertedCurrency = self.currencySelector.inverted();

                    if(invertedCurrency) {
                        url += '&inverted_currency=' + invertedCurrency;
                    }
                }
            }

            url += "&rem_peaks=" + (self.removePeaks() ? 1 : 0);

            return url;
        };

        this.updateChartWithMainSeries = function(symbol, refreshData) {

            var url = this.buildQuotesUrl(symbol);

            if(refreshData) {
                url += '&refreshData=1';
            }

            $.getJSON(url, function (data) {

                self.getMainSerie().setData(data.quotes, false, false, false);
                self.getMainSerie().name = data.symbol;

                self.chart.setTitle( { text: data.symbol + ' Stock Price' } );

                self.updateExtremas(); // recalc extremas

                self.updateTa();

                // Sets zoom level to the last one specified
                if(self.xExtremes) {
                    self.chart.xAxis[0].setExtremes(self.xExtremes.min, self.xExtremes.max, false, false);
                }

                self.chart.redraw();
            });
        };

        this.toMaId = period => {
            return self.maSeriesIdPrefix + period;
        };

        this.toComparisonId = function(symbol) {
            return self.comparedSeriesIdPrefix + symbol;
        };

        this.fromComparisonId = function(seriesId) {
            return seriesId.replace(this.comparedSeriesIdPrefix, '');
        };

        /**
         * Adds compared series to the chart.
         */
        this.addComparisonData = (datas) => {
            var comparedSeries = _.map(datas, function(data) {

                return {
                    type: 'line',
                    yAxis: self.compareYAxisIndex,
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

            comparedSeries.forEach((series) => {
                var s = this.chart.addSeries(series, false, false);
            });

            this.saveState();

        };

        this.getComparedSeries = () => {
            return self.chart.series.filter((serie) => {
                return !serie.options.isInternal && serie.options.id !== 'main' && serie.options.id.startsWith(self.comparedSeriesIdPrefix);
            });
        };

        this.getComparedSymbols = () => {
            return this.getComparedSeries().map(series => this.fromComparisonId(series.options.id));
        };

        this.updateComparedSeriesData = () => {
            this.getComparedSeries().forEach(series => {
                const url = this.buildQuotesUrl(this.fromComparisonId(series.options.id));

                $.getJSON(url, data => {
                    series.setData(data.quotes);
                });
            });
        };

        this.removeSeriesByIdPrefix = seriesIdPrefix => {
            let seriesToRemove = _.filter(self.chart.series, serie => {
                return !serie.options.isInternal && serie.options.id !== 'main' && serie.options.id.startsWith(seriesIdPrefix);
            });

            _.each(seriesToRemove, serie => {
                serie.remove(false);
            });
        };

        this.updateChartWithComparedSeries = function(instruments) {

            var count = 0;
            var datas = [];

            var toAdd = _.reject(instruments, function(instrument) {
                return self.chart.get(self.toComparisonId(instrument.symbol));
            });

            toAdd.forEach(instrument => {
                var url = this.buildQuotesUrl(instrument.symbol);

                $.getJSON(url, function(data) {
                    datas.push(data);
                    count++;

                    if(count === toAdd.length) {
                        this.addComparisonData(datas);
                        self.setCompareChart();
                    }
                }.bind(this));

            });

            // Remove uncompared series
            var seriesToRemove = _.filter(self.getComparedSeries(), serie => {
                return !serie.options.isInternal && serie.options.id !== 'main' && !_.find(instruments, instrument => {
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

            self.setCompare('percent');
        };

        this.setNoCompareChart = function() {
            self.updateMainSerie({ type: 'candlestick' });

            self.setCompare('value');
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

        self.saveState = () => {
            if(this.isLoadingState()) {
                if(!this.isLoadingStateSubscription) {
                    this.isLoadingStateSubscription = this.isLoadingState.subscribe(() => {
                        this.saveState();
                        this.isLoadingStateSubscription.dispose();
                        this.isLoadingStateSubscription = false;
                    });
                }

                return;
            }

            stateRW.save(this.stateId, {
                period: this.selectedPeriod(),
                main: this.chartedInstrument().symbol,
                //compared: this.getComparedSymbols(),
            });
        };

        self.loadState = () => {
            this.isLoadingState(true);
            var state = stateRW.read(this.stateId);
            
            if(state) {
                if(state.period) {
                    this.selectedPeriod(state.period);
                }

                this.chartedInstrument({
                    symbol: state.main
                });

                // Need to sync with lists
                //if(state.compared) {
                //    // Update observable and lists should listen, but they don't
                //    this.comparedInstruments(state.compared.map(c => { 
                //        return { symbol: c } 
                //    }));
                //}
            }

            this.isLoadingState(false);
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

        self.updateExtremas = () => {
            self.removeExtremas();

            if(self.extremasSettings.enabled()) {
                self.showExtremas();
            }

        };

        self.showExtremas = () => {
            var extremasConf = self.extremasSettings.get();
            var data = {
                ttls: extremasConf.wild,
                from: extremasConf.from.valueOf()
            };

            extremasAPI.getExtremas(self.getMainSerie().name, data)
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

        self.isExtremasPlotLinesShown = function() {
            return self.yExtremasPlotLineIds.length > 0;
        };
        
        self.setLinearScale = function() {
            self.chart.yAxis.forEach(yAxis => {
                yAxis.update({ type: 'linear' });
            });
        };

        self.setLogarithmicScale = function() {
            self.chart.yAxis.forEach(yAxis => {
                yAxis.update({ type: 'logarithmic' });
            });
        };

        self.toggleFold = function() {
            self.isFolded(!self.isFolded());
        };

        self.setCompare = val => {
            self.chart.yAxis.forEach(y => {
                if (val === 'percent') {
                    y.update({
                        labels: {
                            formatter: function() {
                                return (this.value > 0 ? ' + ' : '') + this.value + '%';
                            }
                        }
                    }, false);
                } else {
                    y.update({
                        labels: {
                            formatter: function() {
                                return this.value;
                            }
                        }
                    }, false);
                }
                y.setCompare(val === 'value' ? null : val);
            });

            self.compareType(val);
        };

        self.showMovingAverages = settings => {
            let url = self.urlWithPeriodAndSymbol(self.taUrl, self.getMainSerie().name)
                .replace('{mas}', self.taSettings.get().mas); 

            $.getJSON(url, data => {
                let series = data.mas.forEach(data => {

                    let chartSeries = {
                        type: 'line',
                        id: self.toMaId(data.symbol),
                        name: data.symbol,
                        data : data.quotes,
                        tooltip: {
                            valueDecimals: 2
                        }
                    };

                    self.chart.addSeries(chartSeries, false,  false);
                });

                self.chart.redraw();
            });
        };

        self.hideMovingAverages = () => {
            self.removeSeriesByIdPrefix(self.maSeriesIdPrefix);
        };

        self.updateTa = () => {

            self.hideMovingAverages();

            if(self.taSettings.maEnabled()) {
                let settings = self.taSettings.get();
                self.showMovingAverages(settings);
            }
        };

        if(!params.chartedInstrument) {
            throw 'Must supply chartedInstrument';
        }

        if(!params.comparedInstruments) {
            throw 'Must supply comparedInstrument';
        }

        /**
         * Creates the highstock-chart without data.
         */
        this.createChart = function() {
            self.chart = Highcharts.StockChart('chart',  {
                yAxis: [{
                    // Main axis
                    type: 'linear'
                },{
                    // Compare axis
                    type: 'linear',
                    opposite: false
                }],
                xAxis: {
                    events: {
                        setExtremes: function(e) {
                            self.xExtremes = {
                                min: e.min,
                                max: e.max
                            };
                        }
                    },
                    startOnTick: false
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
                        type: 'year',
                        count: 1,
                        text: '1y'
                    }, {
                        type: 'year',
                        count: 3,
                        text: '3y'
                    }, {
                        type: 'year',
                        count: 5,
                        text: '5y'
                    }, {
                        type: 'year',
                        count: 10,
                        text: '10y'
                    }, {
                        type: 'year',
                        count: 15,
                        text: '15y'
                    }, {
                        type: 'year',
                        count: 25,
                        text: '25y'
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

        self.onTaSettingsLoad = function(settings) {
            self.taSettings = settings;
            self.taSettings.onChange = self.updateTa;
        };

        self.onExtremasSettingsLoad = function(extremasSettings) {
            self.extremasSettings = extremasSettings;
            self.extremasSettings.onChange = self.updateExtremas;
        };

        self.onCurrencySelectorLoad = (currencySelector) => {
            self.currencySelector = currencySelector;
            self.currencySelector.onChange = self.updateChartSeries;
        };

        self.chartedInstrument = params.chartedInstrument;
        self.comparedInstruments = params.comparedInstruments;
        self.yExtremasPlotLineIds = [];
        self.xExtremasPlotLineIds = [];
        self.xExtremes = false;

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
