var $ = require('jquery');
var _ = require('underscore');
var ko = require('knockout');

ko.components.register('listSelection', {
    viewModel: function(params) {
        
        if(!params.chartAndList) {
            throw 'Supply chartAndList';
        }

        this.chartAndList = params.chartAndList;
        this.currentMenuItem = params.chartAndList.currentMenuItem;
    },
    template: require('../templates/listSelection.html')
});

