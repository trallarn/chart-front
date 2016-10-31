var $ = require('jquery');
var _ = require('underscore');
var ko = require('knockout');
var PubSub = require('pubsub-js');

var stateRW = require('../infrastructure/StateRW');
var settings = require('../infrastructure/settings');

module.exports = WinnerLoser;

function WinnerLoser(params) {
        
    var self = this;

    if(!params.chartedInstrument) {
        throw 'must supply chartedInstrument';
    }

    if(!params.comparedInstruments ) {
        throw 'must supply comparedInstruments ';
    }

    this.lists = ko.observableArray([
        {
            name: ko.observable(''),
            url:  ko.observable(),
            listType: 'change',
            showErrorList: true
        }
    ]);

    self.updateList = function() {
        var fromDate = new Date(self.from());
        var toDate = self.to() ? new Date(self.to()) : new Date(); // Defaults to today

        if(isNaN(fromDate.getDate())) {
            self.feedback('Invalid date');
            return;
        }

        self.feedback('');
        
        var url = self.baseUrl
            .replace('{index}', self.selectedIndex())
            .replace('{from}', self.from())
            .replace('{to}', self.to());

        self.lists()[0].url(url);
        self.lists()[0].name(self.selectedIndex());

        // Notify chart about range if active
        if(self.isActive()) {
            PubSub.publish('chart/setXRange', { from: fromDate, to: toDate } );

            self.clearPlotLines();

            var fromId = 'from-' + fromDate.getTime();
            var toId = 'to-' + toDate.getTime();
            self.plotLineIds.push(fromId);
            self.plotLineIds.push(toId);

            PubSub.publish('chart/addXPlotLine', { 
                label: {
                    text: 'From'
                },
                value: fromDate, 
                color: 'green',
                id: fromId
            });
            PubSub.publish('chart/addXPlotLine', { 
                label: {
                    text: 'To'
                },
                value: toDate, 
                color: 'red',
                id: toId
            });
        }


        self.saveState();
    };

    self.clearPlotLines = function() {
        _.each(self.plotLineIds, function(id) {
            PubSub.publish('chart/removeXPlotLine', { id: id } ); 
        });

        self.plotLineIds = [];
    };

    self.saveState = function() {
        stateRW.save(self.stateId, {
            from: self.from(),
            to: self.to(),
            selectedIndex: self.selectedIndex()
        });
    };

    self.loadState = function() {
        var state = stateRW.read(self.stateId);
        
        if(state) {
            self.from(state.from);
            self.to(state.to);
            self.selectedIndex(state.selectedIndex);
            self.updateList();
        }
    };

    self.fetchIndices = function(callback) {
        $.getJSON(self.indicesUrl, function(data) {
            self.indices(_.pluck(data, 'name'));

            if(callback) { 
                callback();
            }
        })
        .fail(function(){
            console.log('Failed getting indices');
        });
    };

    self.closeClick = function() {
        self.clearPlotLines();

        if(self.onCloseCallback) {
            self.onCloseCallback();
        }
    };

    self.stateId = 'WinnerLoser';

    //TODO: build back end for new endpoint that takes fromDate toDate
    self.baseUrl = settings.withQuoteAPIBase('/instruments/change?index={index}&from={from}&to={to}&callback=?');
    self.indicesUrl = settings.withQuoteAPIBase('/indices?callback=?');
    self.indices = ko.observableArray();
    self.selectedIndex = ko.observable();
    self.feedback = ko.observable();
    self.chartedInstrument = params.chartedInstrument;
    self.comparedInstruments = params.comparedInstruments;
    self.isActive = params.isActive;

    self.from = ko.observable();
    self.to = ko.observable();

    self.plotLineIds = [];
    self.onCloseCallback = false; // Override with callback

    self.fetchIndices(function() { 
        self.loadState();
    });
}

ko.components.register('winnerLoser', {
    viewModel: WinnerLoser,
    template: require('../templates/winnerLoser.html')
});
