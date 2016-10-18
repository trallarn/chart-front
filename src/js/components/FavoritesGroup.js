var $ = require('jquery');
var _ = require('underscore');
var ko = require('knockout');
var PubSub = require('pubsub-js');

var stateRW = require('../infrastructure/StateRW');

function FavoritesGroup(params) {
    var self = this;

    if(!params.name) {
        throw 'missing name';
    }

    self.addInstruments = function(instruments) {
        self.list(self.list().concat(instruments));
    };

    self.toggleFold = function() {
        self.isFolded(!self.isFolded());
        self.onFold();
    };

    self.fold = function() {
        self.isFolded(true);
        self.onFold();
    };

    self.onFold = function(isFolded) {
        self.isFolded(isFolded);

        if(self.onFoldChange) {
            self.onFoldChange(self, self.isFolded());
        }
    };

    self.onRemoveFromFavoriteClick = function(el) {
        self.list(_.reject(self.list(), function(instrument) { 
            return instrument.symbol === el.symbol; 
        }));
    };

    self.name = params.name;
    self.isFolded = ko.observable();
    self.list = ko.observableArray(params.instruments);
    self.onFoldChange = params.onFoldChange;

    //TODO FOr test
    self.onFold(false);
}

ko.components.register('favoritesGroup', {
    viewModel: FavoritesGroup,
    template: require('../templates/favoritesGroup.html')
});

module.exports = FavoritesGroup;
