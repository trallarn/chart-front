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

        self.buildWinnerLoser = function() {
            var ws = new WinnerLoser(params);
            ws.onCloseCallback = self.onWinnerLoserClose.bind(self, ws);
            return ws;
        };

        /**
         * Removes winner loser from set.
         */
        self.onWinnerLoserClose = function(winnerLoser) {
            var index = self.winnerLosers.indexOf(winnerLoser);

            if (index > -1) {
                self.winnerLosers.splice(index, 1);
            }
        };

        self.createWinnerLoserClick = function() {
            self.winnerLosers.push(self.buildWinnerLoser());
        };

        self.isActive = params.isActive;

        self.winnerLosers = ko.observableArray([
            self.buildWinnerLoser()
        ]);
    },
    template: require('../templates/winnerLoserSet.html')
});


