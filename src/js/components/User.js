var $ = require('jquery');
var _ = require('underscore');
var ko = require('knockout');
var PubSub = require('pubsub-js');

var settings = require('../infrastructure/settings');
var Assertions = require('../infrastructure/Assertions.js');
var stateRW = require('../infrastructure/StateRW');

ko.components.register('user', {
    viewModel: function(params) {
        var self = this;

        self.login = function() {
            self.userAPI.login(self.username())
                .done(function(){
                    self.saveState();
                });
        };

        self.saveState = function() {
            stateRW.save(self.stateId, {
                username: self.username()
            });
        };

        self.loadState = function() {
            var state = stateRW.read(self.stateId);

            if(state.username) {
                self.username(state.username);
                self.login();
            }
        };

        Assertions.throwIfUndefined(params.userAPI);

        self.stateId = 'user';
        self.userAPI = params.userAPI;
        self.username = ko.observable();

        self.loadState();
    },

    template: require('../templates/user.html')
});


