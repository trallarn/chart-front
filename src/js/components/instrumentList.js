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
        if(!params.onElementClick) {
            throw 'must supply onElementClick';
        }

        if(!params.onCompareClick) {
            throw 'must supply onCompareClick';
        }

        this.isFolded = ko.observable(false);

        this.name = params.name;
        this.url = params.url;
        this.onElementClick = params.onElementClick;
        this.onCompareClick = params.onCompareClick ;

        this.fetchData = function(url, list) {

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

        var self = this;

        this.list = ko.observableArray();

        this.fetchData(this.url, this.list);

    },
    template: require('../templates/instrumentList.html')
});
