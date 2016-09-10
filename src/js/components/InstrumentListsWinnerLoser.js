var $ = require('jquery');
var _ = require('underscore');
var ko = require('knockout');

ko.components.register('instrumentListsWinnerLoser', {
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
                name: 'Indices',
                url:  'http://localhost:3000/indexComponents/Indices?callback=?'
            },
            {
                name: 'Stockholm',
                url:  'http://localhost:3000/indexComponents/stockholm?callback=?'
            }
        ]);

        this.chartedInstrument = params.chartedInstrument;
        this.comparedInstruments = params.comparedInstruments;

    },

    template: require('../templates/instrumentLists.html')
});

