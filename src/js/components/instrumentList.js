var $ = require('jquery');
var _ = require('underscore');
var ko = require('knockout');

ko.components.register('instrumentList', {
    viewModel: function(params) {
        if(!params.name) {
            throw 'must supply name';
        }
        if(!params.url) {
            throw 'must supply url';
        }

        var self = this;

        this.isFolded = ko.observable(false);

        this.name = params.name;
        this.url = params.url;
        this.chartedInstrument = params.chartedInstrument;
        this.comparedInstruments = params.comparedInstruments;

        this.fetchData = function(url, list) {

            if(!url) {
                console.log('invalid url: "' + url + '"');
                return false;
            }

            $.getJSON(url , function (data) {
                var models = _.map(data, function(el) {
                    el.active = ko.observable();
                    el.compared = ko.observable();
                    return el;
                });

                list(models);
                self.onElementClick(_.first(list()));
            })
            .fail(function(){
                console.log('Failed getting list');
            });

        };

        this.toggleTableFold = function() {
            self.isFolded(!self.isFolded());
        };

        this.onElementClick = function(el) {
            if(self.chartedInstrument()) {
                self.chartedInstrument().active(false);
            }

            console.log('setting charted instrument to: ' + JSON.stringify(el));
            el.active(true);
            self.chartedInstrument(el);
        };

        this.onCompareClick = function(el) {
            if(self.comparedInstruments.indexOf(el) > -1) {
                self.comparedInstruments.remove(el);
                el.compared(false);
            } else {
                self.comparedInstruments.push(el);
                el.compared(true);
            }
        };

        var self = this;

        this.list = ko.observableArray();

        if(typeof self.url === 'function') {
            self.fetchData(self.url(), self.list);
            self.url.subscribe(function() {
                self.fetchData(self.url(), self.list);
            });
        } else {
            self.fetchData(self.url, self.list);
        }

    },
    template: require('../templates/instrumentList.html')
});
