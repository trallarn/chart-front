var $ = require('jquery');
var _ = require('underscore');
var ko = require('knockout');

ko.components.register('chartAndList', {
    viewModel: function(params) {
        this.chartedInstrument = ko.observable();
    },
    template: require('../templates/chartAndList.html')
});
