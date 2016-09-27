var $ = require('jquery');
var _ = require('underscore');
var ko = require('knockout');
var stateRW = require('../infrastructure/StateRW');

ko.components.register('winnerLoser', {
    viewModel: function(params) {
        
        var self = this;

        if(!params.chartedInstrument) {
            throw 'must supply chartedInstrument';
        }

        if(!params.comparedInstruments ) {
            throw 'must supply comparedInstruments ';
        }

        this.lists = ko.observableArray([
            {
                name: 'Stockholm',
                url:  ko.observable(),
                listType: 'change'
            }
        ]);

        self.updateList = function() {
            var fromDate = new Date(self.from());
            var toDate = new Date(self.to());

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

            self.saveState();
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

        self.stateId = 'WinnerLoser';

        //TODO: build back end for new endpoint that takes fromDate toDate
        self.baseUrl = 'http://localhost:3000/instruments/change?index={index}&from={from}&to={to}&callback=?';
        self.indicesUrl = 'http://localhost:3000/indices?callback=?';
        self.indices = ko.observableArray();
        self.selectedIndex = ko.observable();
        self.feedback = ko.observable();
        self.chartedInstrument = params.chartedInstrument;
        self.comparedInstruments = params.comparedInstruments;

        self.from = ko.observable();
        self.to = ko.observable();

        self.fetchIndices(function() { 
            self.loadState();
        });
    },
    template: require('../templates/winnerLoser.html')
});

