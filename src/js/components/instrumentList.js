var $ = require('jquery');
var _ = require('underscore');
var ko = require('knockout');
var PubSub = require('pubsub-js');

var InstrumentTableSpec = require('../vm/InstrumentTableSpec.js');

ko.components.register('instrumentList', {
    viewModel: function(params) {

        this.updateSelectedInstrument = function() {
            if(!self.chartedInstrument()) {
                return;
            }

            var instrument = self.findInstrumentInList(self.chartedInstrument());

            if(!instrument) {
                self.selectInstrument(false);
            } else if(self.selectedInstrument() === instrument) {
                // do nothing
            } else {
                self.selectInstrument(instrument);
            }

        };

        this.selectInstrument = function(instrument) {
            if(self.selectedInstrument()) {
                self.selectedInstrument().active(false);
            }

            self.selectedInstrument(instrument);

            if(instrument) {
                instrument.active(true);
            }

        };

        this.findInstrumentInList = function(instrument) {
            return _.find(self.list(), function(el) {
                return el.symbol === instrument.symbol;
            });
        };

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
                self.updateSelectedInstrument();
            })
            .fail(function(){
                console.log('Failed getting list');
            });

        };

        this.toggleTableFold = function() {
            self.isFolded(!self.isFolded());

            if(self.onFoldChange) {
                self.onFoldChange(self.isFolded());
            }
        };

        this.onElementClick = function(el) {
            this.chartedInstrument(el);
        };

        this.onCompareClick = function(el) {
            if(this.comparedInstruments.indexOf(el) > -1) {
                this.comparedInstruments.remove(el);
                el.compared(false);
            } else {
                this.comparedInstruments.push(el);
                el.compared(true);
            }
        };

        this.editName = function() {
            self.showEditNameInput(!self.showEditNameInput());
        };

        this.onAddToFavoriteClick = function(el) {
            PubSub.publish('favorites/saveInstruments', [ el ] );
        };

        this.closeClicked = function() {
            if(self.onCloseCallback) {
                self.onCloseCallback();
            } else {
                console.warn('missing close callback');
            }
        };

        if(!params.chartedInstrument) {
            throw 'must supply chartedInstrument';
        }
        if(!params.comparedInstruments) {
            throw 'must supply comparedInstruments';
        }
        if(!params.name) {
            throw 'must supply name';
        }
        if(!params.url) {
            if(!params.list) {
                throw 'must supply url or list';
            }
        }

        var self = this;

        this.actions = params.actions || {};
        this.actions.onElementClick = self.onElementClick.bind(this);
        this.actions.onCompareClick = self.onCompareClick.bind(this) ;
        this.actions.onAddToFavoriteClick = self.onAddToFavoriteClick.bind(this) ;

        this.showCloseButton = params.showCloseButton;
        this.onCloseCallback = params.onCloseCallback;
        this.showEditNameInput = ko.observable(false);
        this.supportEditName = params.supportEditName;
        this.supportEditName = params.supportEditName;
        this.tableSpec = params.tableSpec;
        this.name = params.name;
        this.url = params.url;
        this.onFoldChange = params.onFoldChange;
        this.listType = params.listType;
        this.chartedInstrument = params.chartedInstrument;
        this.comparedInstruments = params.comparedInstruments;
        this.showErrorList = params.showErrorList;
        this.extraClass = params.extraClass;

        this.list = params.list || ko.observableArray();
        this.errorList = ko.observableArray();
        this.isFolded = ko.observable(!!params.isFolded);
        this.errorName = ko.observable('');
        this.selectedInstrument = ko.observable();

        this.chartedInstrument.subscribe(this.updateSelectedInstrument);

        if(typeof this.name === 'function') {
            this.name.subscribe(function(val) {
                self.errorName(val + ' (in error)');
            });
        } else {
            self.errorName(this.name + ' (in error)');
        }

        if(self.url) {
            if(typeof self.url === 'function') {
                self.fetchData(self.url(), self.list, self.errorList);
                self.url.subscribe(function() {
                    self.fetchData(self.url(), self.list, self.errorList);
                });
            } else {
                self.fetchData(self.url, self.list, self.errorList);
            }
        }

    },
    template: require('../templates/instrumentList.html')
});
