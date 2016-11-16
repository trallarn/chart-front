var $ = require('jquery');
var _ = require('underscore');
var ko = require('knockout');
var PubSub = require('pubsub-js');

var stateRW = require('../infrastructure/StateRW');
var InstrumentsAPI = require('../api/InstrumentsAPI');
var instrumentsAPI = new InstrumentsAPI();
var InstrumentVM = require('../vm/InstrumentVM');

function FavoritesGroup(params) {
    var self = this;

    self.addInstruments = function(instruments) {
        var newInstruments = _.reject(instruments, function(instrument) {
            return _.find(self.list(), self.hasSameSymbol.bind(self, instrument));
        });

        self.list(self.list().concat(newInstruments));
        self.onChange();
    };

    self.toggleFold = function() {
        self.isFolded(!self.isFolded());
        self.onFold();
    };

    self.fold = function() {
        self.isFolded(true);
        self.onFold();
    };

    self.onChange = function() {
        if(self.onChangeCallback) {
            self.onChangeCallback(self);
        }
    };

    self.onNameChange = function() {
        self.onChange();
    };

    self.onFold = function(isFolded) {
        self.isFolded(isFolded);

        if(self.onFoldChangeCallback) {
            self.onFoldChangeCallback(self, self.isFolded());
        }
    };

    self.onRemoveFromFavoriteClick = function(el) {
        self.list(_.reject(self.list(), self.hasSameSymbol.bind(self, el)));
        self.onChange();
    };

    self.hasSameSymbol = function(i1, i2) {
        return i1.symbol === i2.symbol; 
    };

    self.toStateObj = function() {
        return {
            id: self.id,
            name: self.name,
            list: _.map(self.list(), function(instr) { 
                return instr.symbol; 
            })
        };
    };

    self.readState = function(state) {
        self.id = state.id;
        self.name(state.name);
        self.isFolded(true);

        instrumentsAPI.getInstruments(state.list || [])
            .then(function(instruments) {
                self.list(instruments ? InstrumentVM.toModels(instruments) : []);
            });
    };

    self.actions = {
        onRemoveFromFavoriteClick: self.onRemoveFromFavoriteClick
    };

    var state = params.state;

    if(!state && !params.name) {
        throw 'missing name';
    }

    self.selected = ko.observable(false);
    self.name = params.name;
    self.isFolded = ko.observable();
    self.list = ko.observableArray(params.instruments);
    self.onFoldChangeCallback  = params.onFoldChange;
    self.onCloseCallback  = params.onClose.bind(this);
    self.onChangeCallback = params.onChange.bind(this);

    if(state) {
        self.readState(state);
    }
}

ko.components.register('favoritesGroup', {
    viewModel: FavoritesGroup,
    template: require('../templates/favoritesGroup.html')
});

module.exports = FavoritesGroup;
