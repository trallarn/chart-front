var $ = require('jquery');
var _ = require('underscore');
var ko = require('knockout');
var PubSub = require('pubsub-js');

var settings = require('../infrastructure/settings');
var Assertions = require('../infrastructure/Assertions.js');

ko.components.register('user', {
    viewModel: function(params) {
        var self = this;

        self.login = function() {
            self.userAPI.login(self.username())
                .done(function(){
                    PubSub.publish('notification.info', { msg: 'Logged in as ' + self.username() });
                });
                    
        };

        Assertions.throwIfUndefined(params.userAPI);

        self.userAPI = params.userAPI;
        self.username = ko.observable();
    },

    template: require('../templates/user.html')
});


