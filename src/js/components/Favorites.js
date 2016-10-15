var $ = require('jquery');
var _ = require('underscore');
var ko = require('knockout');
var PubSub = require('pubsub-js');
var FavoritesGroup = require('./FavoritesGroup');

var stateRW = require('../infrastructure/StateRW');

ko.components.register('favorites', {
    viewModel: function(params) {
        var self = this;

        self.saveInstruments = function(msg, instruments) {
            if(!self.currentGroup()) {
                PubSub.publish('notification.warn', { msg: 'No favorite group selected' } );
                return;
            }

            self.currentGroup().addInstruments(instruments);
            
        };

        self.toggleFold = function() {
            self.isFolded(!self.isFolded());
        };

        self.onGroupFoldChange = function(group, isFolded) {
            if(!isFolded) {
                self.currentGroup(group);
            }
        };

        self.groups = ko.observableArray(
            [
                new FavoritesGroup({
                    name: 1,
                    instruments: [],
                    onFoldChange: self.onGroupFoldChange
                }) 
            ]
        );

        // Todo: read favorites from state?
        self.currentGroup = ko.observable();

        self.isFolded = ko.observable(false);

        PubSub.subscribe('favorites/saveInstruments', self.saveInstruments);
        PubSub.subscribe('favorites/toggleFold', self.toggleFold);

    },
    template: require('../templates/favorites.html')
});
