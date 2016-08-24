var $ = require('jquery');
var _ = require('underscore');
var ko = require('knockout');

ko.components.register('instrumentList', {
    viewModel: function(params) {
        if(!params.chartedInstrument) {
            throw 'must supply chartedInstrument';
        }

        this.fetchData = function(url, list) {

            $.getJSON(url , function (data) {
                var models = _.map(data, function(el) {
                    el.active = ko.observable();
                    return el;
                });

                list(models);
                self.onElementClick(_.first(list()));
            })
            .fail(function(){
                console.log('Failed getting list');
            });

        };

        this.onElementClick = function(el) {
            if(self.chartedInstrument()) {
                self.chartedInstrument().active(false);
            }

            console.log('setting charted instrument to: ' + JSON.stringify(el));
            el.active(true);
            self.chartedInstrument(el);
        }

        var self = this;

        this.chartedInstrument = params.chartedInstrument;

        this.instruments = ko.observableArray();
        this.indices = ko.observableArray();
        this.instrumentsUrl = 'http://localhost:3000/indexComponents/stockholm?callback=?';
        this.indicesUrl = 'http://localhost:3000/indexComponents/Indices?callback=?';

        this.fetchData(this.instrumentsUrl, this.instruments);
        this.fetchData(this.indicesUrl, this.indices);

    },
    template: require('../templates/instrumentList.html')
});
