var $ = require('jquery');
var PubSub = require('pubsub-js');

var settings = require('../infrastructure/settings');

function ExtremasAPI(options) {
}

ExtremasAPI.prototype = {

    /**
     * Gets local min max for the given symbol
     */
    getExtremas: function(symbol, data) {
        if(!symbol) {
            throw 'Must supply symbol';
        }

        return Promise.resolve($.ajax({
            url: settings.withAPIBase('extremasAPI', '/' + symbol), 
            type: 'GET',
            data: data,
            xhrFields: {
                withCredentials: true
            }
        }))
            .catch(function(e) {
                this._notifyFail(e);
            }.bind(this));
    },

    _notifyFail: function(e) {
        PubSub.publish('notification.warn', { msg: 'Instrument API-request failed.' + (e ? 'With message: ' + e : '') });
    }

};

module.exports = new ExtremasAPI();

