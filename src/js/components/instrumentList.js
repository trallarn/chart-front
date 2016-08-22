var $ = require('jquery');
var _ = require('underscore');
var ko = require('knockout');

ko.components.register('instrumentList', {
    viewModel: function(params) {
        if(!params.chartedInstrument) {
            throw 'must supply chartedInstrument';
        }

        var self = this;

        this.chartedInstrument = params.chartedInstrument;
        this.instruments = ko.observableArray();
        this.url = 'http://localhost:3000/instruments?callback=?';

        $.getJSON(this.url, function (data) {
            self.instruments(data);
            self.chartedInstrument(_.first(self.instruments()));
        })
        .fail(function(){
            console.log('Failed getting instruments');
        });

        this.onElementClick = function(el) {
            console.log('setting charted instrument to: ' + JSON.stringify(el));
            self.chartedInstrument(el);
        }
    },
    template: require('../templates/instrumentList.html')
});
