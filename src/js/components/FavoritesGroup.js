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
            name: self.name(),
            list: _.map(self.list(), function(instr) { 
                return instr.symbol; 
            })
        };
    };

    self.actions = {
        onRemoveFromFavoriteClick: self.onRemoveFromFavoriteClick
    };

    if(!params.name) {
        throw 'missing name';
    }

    self.selected = ko.observable(false);
    self.id = params.id;
    self.name = ko.observable(params.name);
    self.isFolded = ko.observable(!!params.isFolded);
    self.list = ko.observableArray(params.list);
    self.onFoldChangeCallback  = params.onFoldChange;
    self.onCloseCallback  = params.onClose.bind(this);
    self.onChangeCallback = params.onChange.bind(this);

}

/**
 * Constructs from a group state.
 */
FavoritesGroup.fromState = function(state, options) {

    options = _.extend({}, state, options);
    options.list = []; // Empty list is populated below
    var group = new FavoritesGroup(options);

    instrumentsAPI.getInstruments(state.list || [])
        .then(function(instruments) {
            group.list(instruments ? InstrumentVM.toModels(instruments) : []);
        });

    return group;
};

ko.components.register('favoritesGroup', {
    viewModel: FavoritesGroup,
    template: require('../templates/favoritesGroup.html')
});

module.exports = FavoritesGroup;
