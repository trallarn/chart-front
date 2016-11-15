var $ = require('jquery');
var PubSub = require('pubsub-js');

var settings = require('../infrastructure/settings');

module.exports = UserAPI;

function UserAPI() {
}

UserAPI.prototype = {

    login: function(username) {
        return $.post(settings.withAPIBase('userAPI', '/user/login'), {
            username: username
        })
            .fail(function() {
                console.warn('login request failed');
                PubSub.publish('notification.warn', { msg: 'Login failed' } );
            });
    }

};

