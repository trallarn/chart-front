var $ = require('jquery');
var _ = require('underscore');
var ko = require('knockout');

ko.components.register('instrumentLists', {
    viewModel: function(params) {

        var self = this;

        this.params = params;

        if(!params.chartedInstrument) {
            throw 'must supply chartedInstrument';
        }

        if(!params.comparedInstruments ) {
            throw 'must supply comparedInstruments ';
        }
        if(!params.lists ) {
            throw 'must supply lists ';
        }

        this.lists = params.lists;
        this.chartedInstrument = params.chartedInstrument;
        this.comparedInstruments = params.comparedInstruments;

    },

    template: require('../templates/instrumentLists.html')
});

