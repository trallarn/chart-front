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
            var models = _.map(data, function(el) {
                el.active = ko.observable();
                return el;
            });

            self.instruments(models);
            self.onElementClick(_.first(self.instruments()));
        })
        .fail(function(){
            console.log('Failed getting instruments');
        });

        this.onElementClick = function(el) {
            if(self.chartedInstrument()) {
                self.chartedInstrument().active(false);
            }

            console.log('setting charted instrument to: ' + JSON.stringify(el));
            el.active(true);
            self.chartedInstrument(el);
        }
    },
    template: require('../templates/instrumentList.html')
});
