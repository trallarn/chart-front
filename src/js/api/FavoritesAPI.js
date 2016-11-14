var $ = require('jquery');

var settings = require('../infrastructure/settings');

module.exports = FavoritesAPI;

function FavoritesAPI() {

}

FavoritesAPI.prototype = {
    saveGroup: function(group) {
        $.post(settings.withAPIBase('favoritesAPI', '/favorites'), group.toStateObj())
            .done(function(data) {
                // Set id on the group model
                group['_id'] = data['_id'];
            })
            .fail(function() {
                console.warn('savegroup request failed');
            });
    },

    deleteGroup: function(group) {
        $.ajax('/favorites/' + group.id, {
            method: 'delete'
        })
            .done(function(data) {
            })
            .fail(function() {
                console.warn('savegroup request failed');
            });
    }

};
