var $ = require('jquery');
var _ = require('underscore');
var ko = require('knockout');
var PubSub = require('pubsub-js');
var FavoritesGroup = require('./FavoritesGroup');
var moment = require('moment');

var stateRW = require('../infrastructure/StateRW');
var assertions = require('../infrastructure/Assertions.js');

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

            self.deleteGroup(this);
        };
       
        self.addGroup = function() {
            var newGroup = new FavoritesGroup({
                name: ko.observable(moment().format('lll')),
                instruments: [],
                onClose: self.onGroupClose,
                onFoldChange: self.onGroupFoldChange
            });

            self.groups.unshift(newGroup);
            self.saveGroup(newGroup);
        };

        self.loadGroups = function() {
            // TODO
            //self.groups([
            //    new FavoritesGroup({
            //        name: ko.observable(1),
            //        instruments: [],
            //        onClose: self.onGroupClose,
            //        onFoldChange: self.onGroupFoldChange
            //    }) 
            //]);
        };

        self.saveGroup = function(group) {
            self.favoritesAPI.saveGroup(group);
        };

        self.deleteGroup = function(group) {
            self.favoritesAPI.deleteGroup(group);
        };

        assertions.throwIfUndefined(params.favoritesAPI);

        self.favoritesAPI = params.favoritesAPI;

        // Todo: read favorites from state?
        self.currentGroup = ko.observable();

        self.isFolded = ko.observable(false);

        self.groups = ko.observableArray();

        self.currentGroup.subscribe(function(val){
            if(val) {
                val.selected(false);
            }
        }, null, 'beforeChange');

        self.currentGroup.subscribe(function(val){
            val.selected(true);
        });

        PubSub.subscribe('favorites/saveInstruments', self.saveInstruments);
        PubSub.subscribe('favorites/toggleFold', self.toggleFold);

        self.loadGroups();
    },
    template: require('../templates/favorites.html')
});
