var $ = require('jquery');
var PubSub = require('pubsub-js');

var settings = require('../infrastructure/settings');

module.exports = UserAPI;

function UserAPI() {
}

UserAPI.prototype = {

    login: function(username) {
        return $.ajax({
            url: settings.withAPIBase('userAPI', '/user/login'),
            type: 'POST',
            xhrFields: {
                withCredentials: true
            },
            data: {
                username: username
            }
        })
            .done(function() {
                PubSub.publish('notification.info', { msg: 'Logged in as ' + username });
                PubSub.publish('user.loggedIn');
            })
            .fail(function() {
                console.warn('login request failed');
                PubSub.publish('notification.warn', { msg: 'Login failed' } );
            });
    }

};

