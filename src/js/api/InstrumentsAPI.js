var $ = require('jquery');
var PubSub = require('pubsub-js');

var settings = require('../infrastructure/settings');

function InstrumentsAPI(options) {
}

InstrumentsAPI.prototype = {

    getInstruments: function(symbols) {
        var data = {};

        if(symbols) {
            if(symbols.length === 0) {
                return Promise.resolve([]);
            } else {
                data.symbols = symbols;
            }
        }

        return Promise.resolve($.ajax({
            url: settings.withAPIBase('instrumentsAPI', '/instruments'), 
            type: 'GET',
            data: data,
            xhrFields: {
                withCredentials: true
            }
        }))
            .catch(function() {
                this._notifyFail();
            }.bind(this));
    },

    getIndices: function(callback) {
        var indicesUrl = settings.withQuoteAPIBase('/indices?callback=?');

        return Promise.resolve($.getJSON(indicesUrl))
            .catch(function(){
                console.log('Failed getting indices');
            });
    },

    _notifyFail: function(e) {
        PubSub.publish('notification.warn', { msg: 'Instrument API-request failed.' + (e ? 'With message: ' + e : '') });
    }

};

module.exports = new InstrumentsAPI();

