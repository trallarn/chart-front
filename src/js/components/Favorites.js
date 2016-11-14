var $ = require('jquery');
var _ = require('underscore');
var ko = require('knockout');
var PubSub = require('pubsub-js');
var FavoritesGroup = require('./FavoritesGroup');
var moment = require('moment');

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

        self.onGroupClose = function() {
            var index = self.groups.indexOf(this);

            if(index < 0) {
                throw 'Invalid group with name: ' + this.name();
            }

            self.groups.splice(index, 1);
        };
       
        self.addGroup = function() {
            self.groups.unshift(
                new FavoritesGroup({
                    name: ko.observable(moment().format('lll')),
                    instruments: [],
                    onClose: self.onGroupClose,
                    onFoldChange: self.onGroupFoldChange
                }) 
            );
        };

        // Todo: read favorites from state?
        self.currentGroup = ko.observable();

        self.isFolded = ko.observable(false);

        self.groups = ko.observableArray(
            [
                new FavoritesGroup({
                    name: ko.observable(1),
                    instruments: [],
                    onClose: self.onGroupClose,
                    onFoldChange: self.onGroupFoldChange
                }) 
            ]
        );

        self.currentGroup.subscribe(function(val){
            val.selected(false);
        }, null, 'beforeChange');

        self.currentGroup.subscribe(function(val){
            val.selected(true);
        });

        PubSub.subscribe('favorites/saveInstruments', self.saveInstruments);
        PubSub.subscribe('favorites/toggleFold', self.toggleFold);

    },
    template: require('../templates/favorites.html')
});
