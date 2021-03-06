var $ = require('jquery');
var _ = require('underscore');
var ko = require('knockout');
var PubSub = require('pubsub-js');
var FavoritesGroup = require('./FavoritesGroup');
var moment = require('moment');

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

        self.fold = function() {
            this.isFolded(true);
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

        self.onGroupChange = function(group) {
            self.updateGroupDebounced(group);
        };
       
        self.addGroup = function() {
            var newGroup = new FavoritesGroup(
                _.extend({
                    name: moment().format('lll'),
                    list: []
                }, self.groupOptions)
            );

            self.groups.unshift(newGroup);
            self.saveGroup(newGroup);
        };

        self.loadGroups = function() {
            self.favoritesAPI.loadFavorites()
                .done(function(groups) {
                    self.groups(_.map(groups, function(groupState) {

                        var options = _.extend({ isFolded: true }, self.groupOptions);
                        return FavoritesGroup.fromState(groupState, options);
                    }));
                });
        };

        self.saveGroup = function(group) {
            self.favoritesAPI.saveGroup(group);
        };

        self.deleteGroup = function(group) {
            self.favoritesAPI.deleteGroup(group);
        };

        assertions.throwIfUndefined(params.favoritesAPI);

        self.favoritesAPI = params.favoritesAPI;
        self.updateGroupDebounced = _.debounce(self.favoritesAPI.updateGroup, 1000);

        self.groupOptions = {
            onChange: self.onGroupChange,
            onClose: self.onGroupClose,
            onFoldChange: self.onGroupFoldChange
        };

        self.currentGroup = ko.observable();

        self.isFolded = ko.observable(true);

        self.groups = ko.observableArray();

        self.currentGroup.subscribe(function(val){
            if(val) {
                val.selected(false);
            }
        }, null, 'beforeChange');

        self.currentGroup.subscribe(function(val){
            val.selected(true);
        });

        self.onMouseClick = function(e) {
            if(!(e.target.closest('.favorites') || e.target.closest('.favorites-button'))) {
                self.fold();
            }
        };

        self.isFolded.subscribe(function(val) {
            if(!val) {
                window.addEventListener('click', self.onMouseClick, true);
            } else {
                window.removeEventListener('click', self.onMouseClick, true);
            }
        });

        PubSub.subscribe('favorites/saveInstruments', self.saveInstruments);
        PubSub.subscribe('favorites/toggleFold', self.toggleFold);

        PubSub.subscribe('user.loggedIn', self.loadGroups);
    },
    template: require('../templates/favorites.html')
});
