var $ = require('jquery');
var _ = require('underscore');
var ko = require('knockout');

ko.components.register('instrumentList', {
    viewModel: function(params) {
        if(!params.name) {
            throw 'must supply name';
        }
        if(!params.url) {
            throw 'must supply url';
        }

        var self = this;

        this.isFolded = ko.observable(false);

        this.name = params.name;

        this.errorName = ko.observable('');

        if(typeof this.name === 'function') {
            this.name.subscribe(function(val) {
                self.errorName(val + ' (in error)');
            });
        } else {
            self.errorName(this.name + ' (in error)');
        }

        this.url = params.url;
        this.listType = params.listType;
        this.chartedInstrument = params.chartedInstrument;
        this.comparedInstruments = params.comparedInstruments;
        this.showErrorList = params.showErrorList;
        this.oldChartedInstrument = ko.observable();


        this.onChartedInstrumentChange = function() {
            if(!self.chartedInstrument()) {
                return;
            }

            if(self.chartedInstrument() === self.oldChartedInstrument()) {
                return;
            }

            if(!self.chartedInstrument().active) {
                var instrument = _.find(self.list(), function(instrument) {
                    return instrument.symbol === self.chartedInstrument().symbol;
                });

                if(instrument) {
                    self.chartedInstrument(instrument);
                    //Recurse
                    return;
                }
            }

            if(self.chartedInstrument().active) {
                self.chartedInstrument().active(true);
            } 

            // Inactivate old instrument
            if(self.oldChartedInstrument()) {
                self.oldChartedInstrument().active(false);
            }

            self.oldChartedInstrument(self.chartedInstrument());
        };

        this.chartedInstrument.subscribe(this.onChartedInstrumentChange);

        this.fetchData = function(url, list, errorList) {

            if(!url) {
                console.log('invalid url: "' + url + '"');
                return false;
            }

            $.getJSON(url , function (data) {
                var models = _.map(data, function(el) {
                    el.active = ko.observable();
                    el.compared = ko.observable();
                    return el;
                });

                var errorFilter = function(instrument) {
                    return instrument.extra && instrument.extra.error || false;
                };

                var includedModels = _.reject(models, errorFilter);
                var excludedModels = _.filter(models, errorFilter);

                list(includedModels);
                errorList(excludedModels);
                self.onChartedInstrumentChange();
            })
            .fail(function(){
                console.log('Failed getting list');
            });

        };

        this.toggleTableFold = function() {
            self.isFolded(!self.isFolded());
        };

        this.onElementClick = function(el) {
            self.chartedInstrument(el);
        };

        this.onCompareClick = function(el) {
            if(self.comparedInstruments.indexOf(el) > -1) {
                self.comparedInstruments.remove(el);
                el.compared(false);
            } else {
                self.comparedInstruments.push(el);
                el.compared(true);
            }
        };

        var self = this;

        this.list = ko.observableArray();
        this.errorList = ko.observableArray();

        if(typeof self.url === 'function') {
            self.fetchData(self.url(), self.list, self.errorList);
            self.url.subscribe(function() {
                self.fetchData(self.url(), self.list, self.errorList);
            });
        } else {
            self.fetchData(self.url, self.list, self.errorList);
        }

    },
    template: require('../templates/instrumentList.html')
});
