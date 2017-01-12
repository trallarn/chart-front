var $ = require('jquery');
var _ = require('underscore');
var ko = require('knockout');
var PubSub = require('pubsub-js');
var moment = require('moment');

var WinnerLoser = require('./WinnerLoser');
var stateRW = require('../infrastructure/StateRW');
var settings = require('../infrastructure/settings');
var InstrumentTableSpec = require('../vm/InstrumentTableSpec');
var instrumentsAPI = require('../api/InstrumentsAPI');

function Extremas(params) {
    var self = this;

    if(!params.chartedInstrument) {
        throw 'must supply chartedInstrument';
    }

    if(!params.comparedInstruments ) {
        throw 'must supply comparedInstruments ';
    }

    self.updateList = function() {
        var extremasConf = self.extremasSettings.get();
        var url = self.baseUrl
            .replace('{index}', self.selectedIndex())
            .replace('{ttl}', extremasConf.wild)
            .replace('{at}', self.at())
            .replace('{withinPercent}', self.withinPercent())
            .replace('{from}', extremasConf.from);

        self.lists()[0].url(url);

        self.saveState();
    };

    self.saveState = function() {
        stateRW.save(self.stateId, {
            selectedIndex: self.selectedIndex(),
            at: self.at(),
            withinPercent: self.withinPercent()
        });
    };

    self.loadState = function(state) {
        var state = stateRW.read(self.stateId);

        if(state) {
            
            if(self.indices().length > 0) {
                self.selectedIndex(state.selectedIndex);
                self.at(state.at);
                self.withinPercent(state.withinPercent);
                self.updateList();
            } else {
                self.deferredStateLoad = self.loadState.bind(self, state);
            }
        }
    };

    /**
     * Fetches indices for the drop down and calls any deferred load state.
     */
    self.fetchIndices = function(callback) {
        instrumentsAPI.getIndices()
            .then(function(data){
                self.indices(_.pluck(data, 'name'));

                if(self.deferredStateLoad) {
                    self.deferredStateLoad();
                }
            });
    };

    self.onExtremasSettingsLoad = function(extremasSettings) {
        self.extremasSettings = extremasSettings;
    };

    self.deferredStateLoad = false;

    self.lists = ko.observableArray([
        {
            name: ko.observable(''),
            url:  ko.observable(),
            tableSpec: InstrumentTableSpec.defaultSpec(),
            showErrorList: false
        }
    ]);

    self.baseUrl = settings.withAPIBase('extremasAPI', '/closeTo/{ttl}/{from}?index={index}&at={at}&withinPercent={withinPercent}');
    self.stateId = 'extremas';
    self.isActive = params.isActive;
    self.selectedIndex = ko.observable();
    self.at = ko.observable(moment().format('YYYY-MM-DD'));
    self.withinPercent = ko.observable(5);
    self.indices = ko.observableArray();

    self.loadState();
    self.fetchIndices();
}

ko.components.register('extremas', {
    viewModel: Extremas,
    template: require('../templates/extremas.html')
});


