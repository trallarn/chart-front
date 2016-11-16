var $ = require('jquery');
var PubSub = require('pubsub-js');

var settings = require('../infrastructure/settings');

module.exports = FavoritesAPI;

function FavoritesAPI(options) {
}

FavoritesAPI.prototype = {
    loadFavorites: function() {
        return $.ajax({
            type: 'GET',
            url: settings.withAPIBase('favoritesAPI', '/favorites'), 
            xhrFields: {
                withCredentials: true
            }
        })
            .fail(function() {
                console.warn('savegroup request failed');
                this._notifyFail();
            }.bind(this));
    },

    updateGroup: function(group) {
        $.ajax({
            type: 'PUT',
            url: settings.withAPIBase('favoritesAPI', '/favorites'), 
            data: group.toStateObj(),
            xhrFields: {
                withCredentials: true
            }
        })
            .fail(function() {
                console.warn('savegroup request failed');
                this._notifyFail();
            }.bind(this));
    },
    saveGroup: function(group) {
        $.ajax({
            type: 'POST',
            url: settings.withAPIBase('favoritesAPI', '/favorites'), 
            data: group.toStateObj(),
            xhrFields: {
                withCredentials: true
            }
        })
            .done(function(data) {
                // Set id on the group model
                group['_id'] = data['_id'];
            })
            .fail(function() {
                console.warn('savegroup request failed');
                this._notifyFail();
            }.bind(this));
    },

    deleteGroup: function(group) {
        if(!group.id) {
            return Promise.reject('missing id');
        }

        return Promise.resolve($.ajax({
            url: settings.withAPIBase('favoritesAPI', '/favorites/' + group.id), 
            type: 'DELETE',
            xhrFields: {
                withCredentials: true
            }
        }))
            .catch(function() {
                console.warn('deletegroup request failed');
                this._notifyFail();
            }.bind(this));
    },

    _notifyFail: function() {
        PubSub.publish('notification.warn', { msg: 'Favorite group request failed. Are you logged in?' });
    }

};
