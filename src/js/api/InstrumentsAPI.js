var $ = require('jquery');
var PubSub = require('pubsub-js');

var settings = require('../infrastructure/settings');

module.exports = InstrumentsAPI;

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

    getExtremas: function(symbol, data) {
        if(!symbol) {
            throw 'Must supply symbol';
        }
        if(!data.epsilon) {
            throw 'Must supply epsilon';
        }

        return Promise.resolve($.ajax({
            url: settings.withAPIBase('seriesAnalysisAPI', '/seriesAnalysis/extremas/' + symbol), 
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

