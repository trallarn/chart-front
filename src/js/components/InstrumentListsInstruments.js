var $ = require('jquery');
var _ = require('underscore');
var ko = require('knockout');
var settings = require('../infrastructure/settings');

ko.components.register('instrumentListsInstruments', {
    viewModel: function(params) {

        var self = this;

        this.params = params;

        if(!params.chartedInstrument) {
            throw 'must supply chartedInstrument';
        }

        if(!params.comparedInstruments ) {
            throw 'must supply comparedInstruments ';
        }

        this.lists = ko.observableArray([
            {
                name: 'Nordic indices',
                url:  settings.withQuoteAPIBase('/indexComponents/Indices?callback=?')
            },
            {
                name: 'Int.indices',
                url:  settings.withQuoteAPIBase('/indexComponents/IntIndices?callback=?')
            },
            {
                name: 'Currencies',
                url:  settings.withQuoteAPIBase('/indexComponents/Currencies?callback=?')
            },
            {
                name: 'Commodities',
                url:  settings.withQuoteAPIBase('/indexComponents/Commodities?callback=?')
            },
            {
                name: 'Stockholm',
                url:  settings.withQuoteAPIBase('/indexComponents/stockholm?callback=?')
            }
        ]);

        this.chartedInstrument = params.chartedInstrument;
        this.comparedInstruments = params.comparedInstruments;

    },

    template: require('../templates/instrumentLists.html')
});

