var $ = require('jquery');
var _ = require('underscore');
var ko = require('knockout');
var PubSub = require('pubsub-js');

var WinnerLoser = require('./WinnerLoser');
var stateRW = require('../infrastructure/StateRW');
var settings = require('../infrastructure/settings');

ko.components.register('winnerLoserSet', {
    viewModel: function(params) {
        var self = this;

        if(!params.chartedInstrument) {
            throw 'must supply chartedInstrument';
        }

        if(!params.comparedInstruments ) {
            throw 'must supply comparedInstruments ';
        }

        self.buildWinnerLoser = function(wsState) {
            var ws = new WinnerLoser(params);
            ws.onCloseCallback = self.onWinnerLoserClose.bind(self, ws);

            if(wsState) {
                ws.loadState(wsState);
            }

            ws.onStateChangeCallback = self.saveState.bind(self);

            return ws;
        };

        /**
         * Removes winner loser from set.
         */
        self.onWinnerLoserClose = function(winnerLoser) {
            var index = self.winnerLosers.indexOf(winnerLoser);

            if (index > -1) {
                self.winnerLosers.splice(index, 1);
                self.saveState();
            }
        };

        self.saveState = function() {
            stateRW.save(self.stateId, {
                winnerLosers: _.map(self.winnerLosers(), function(ws) { return ws.buildState(); })
            });
        };

        self.createWinnerLoserClick = function() {
            self.winnerLosers.push(self.buildWinnerLoser());
        };

        self.loadState = function() {
            var state = stateRW.read(self.stateId);

            if(state) {
                _.each(state.winnerLosers, function(wsState) {
                    self.winnerLosers.push(self.buildWinnerLoser(wsState));
                });
            } else {
                self.winnerLosers.push(self.buildWinnerLoser());
            }

        };

        self.stateId = 'winnerLosersSet';
        self.isActive = params.isActive;
        self.winnerLosers = ko.observableArray([ ]);

        self.loadState();
    },
    template: require('../templates/winnerLoserSet.html')
});


