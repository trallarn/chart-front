var $ = require('jquery');
var _ = require('underscore');
var ko = require('knockout');
var PubSub = require('pubsub-js');

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
            }


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
        self.isActive = params.isActive;

        self.from = ko.observable();
        self.to = ko.observable();

        self.fetchIndices(function() { 
            self.loadState();
        });
    },
    template: require('../templates/winnerLoser.html')
});


