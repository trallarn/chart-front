var $ = require('jquery');
var _ = require('underscore');
var ko = require('knockout');

ko.components.register('winnerLoser', {
    viewModel: function(params) {
        
        var self = this;

        if(!params.chartedInstrument) {
            throw 'must supply chartedInstrument';
        }

        if(!params.comparedInstruments ) {
            throw 'must supply comparedInstruments ';
        }

        this.lists = ko.observableArray([
            {
                name: 'Stockholm',
                url:  ko.observable()
            }
        ]);

        self.updateList = function() {
            var fromDate = new Date(self.from());
            var toDate = new Date(self.to());

            if(isNaN(fromDate.getDate())) {
                self.feedback('Invalid date');
                return;
            }

            self.feedback('');
            
            var url = self.baseUrl
                .replace('{from}', self.from())
                .replace('{to}', self.to());

            self.lists()[0].url(url);
        };

        //TODO: build back end for new endpoint that takes fromDate toDate
        self.baseUrl = 'http://localhost:3000/instruments/change?index=Indices&from={from}&to={to}&callback=?';
        self.feedback = ko.observable();
        self.chartedInstrument = params.chartedInstrument;
        self.comparedInstruments = params.comparedInstruments;

        self.from = ko.observable();
        self.to = ko.observable();

    },
    template: require('../templates/winnerLoser.html')
});


