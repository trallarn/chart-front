var $ = require('jquery');
var _ = require('underscore');
var ko = require('knockout');
var PubSub = require('pubsub-js');

ko.components.register('favoritesButton', {
    viewModel: function(params) {
        var self = this;

        self.toggleFavoritesFold = function() {
            PubSub.publish('favorites/toggleFold');
        };

    },
    template: require('../templates/favoritesButton.html')
});


