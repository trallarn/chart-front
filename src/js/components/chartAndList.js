var $ = require('jquery');
var _ = require('underscore');
var ko = require('knockout');

ko.components.register('chartAndList', {
    viewModel: function(params) {
        this.chartedInstrument = ko.observable();
        this.comparedInstruments = ko.observableArray();
        this.currentMenuItem = ko.observable('WinnerLoser');
    },
    template: require('../templates/chartAndList.html')
});
