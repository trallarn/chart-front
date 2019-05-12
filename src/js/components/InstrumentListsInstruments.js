var $ = require('jquery');
var _ = require('underscore');
var ko = require('knockout');
var settings = require('../infrastructure/settings');
var InstrumentTableSpec = require('../vm/InstrumentTableSpec.js');

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
                url:  settings.withQuoteAPIBase('/indexComponents/Indices?callback=?'),
                tableSpec: InstrumentTableSpec.indexSpec()
            },
            {
                name: 'Int.indices',
                url:  settings.withQuoteAPIBase('/indexComponents/IntIndices?callback=?'),
                tableSpec: InstrumentTableSpec.indexSpec()
            },
            {
                name: 'Currencies',
                url:  settings.withQuoteAPIBase('/indexComponents/Currencies?callback=?'),
                tableSpec: InstrumentTableSpec.indexSpec()
            },
            {
                name: 'Interest',
                url:  settings.withQuoteAPIBase('/indexComponents/Interests?callback=?'),
                tableSpec: InstrumentTableSpec.indexSpec()
            },
            {
                name: 'Commodities',
                url:  settings.withQuoteAPIBase('/indexComponents/Commodities?callback=?'),
                tableSpec: InstrumentTableSpec.indexSpec()
            },
            {
                name: 'Stockholm',
                url:  settings.withQuoteAPIBase('/indexComponents/stockholm?callback=?'),
                tableSpec: InstrumentTableSpec.defaultSpec()
            }
        ]);

        this.chartedInstrument = params.chartedInstrument;
        this.comparedInstruments = params.comparedInstruments;

    },

    template: require('../templates/instrumentLists.html')
});

