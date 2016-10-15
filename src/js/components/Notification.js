var _ = require('underscore');
var ko = require('knockout');
var PubSub = require('pubsub-js');

/**
 * Supported pubsub parameters:
 * notification.<warn|info|error>, { msg: <msg> }
 */
ko.components.register('notification', {
    viewModel: function(params) {
        var self = this;

        self.show = function(label, data) {

            if(!data.msg) {
                throw 'missing data.msg';
            }

            var level = label.split('.')[1];

            self.message(data.msg);
            self.level(level);
            self.isHidden(false);
            self.setRemoveTimeout();
        };

        self.setRemoveTimeout = function() {
            clearTimeout(self.removeMessageTimeout);
            self.removeMessageTimeout = setTimeout(self.removeMessage, 5000);
        };

        self.removeMessage = function() {
            self.isHidden(true);
            self.message(false);
        };

        self.removeMessageTimeout = false;
        self.isHidden = ko.observable(true);
        self.message = ko.observable('');
        self.level = ko.observable('info');

        PubSub.subscribe('notification', self.show);
    },
    template: require('../templates/notification.html')
});

