var $ = require('jquery');
var _ = require('underscore');
var ko = require('knockout');

ko.components.register('listSelection', {
    viewModel: function(params) {
        
        if(!params.chartAndList) {
            throw 'Supply chartAndList';
        }

        var self = this;

        this.determineVisibleItem = function() {
            self.isWinnerLoserVisible(self.currentMenuItem() === 'WinnerLoser');
            self.isInstrumentsVisible(self.currentMenuItem() === 'Instruments');
        };

        this.chartAndList = params.chartAndList;
        this.currentMenuItem = params.chartAndList.currentMenuItem;

        this.isWinnerLoserVisible = ko.observable();
        this.isInstrumentsVisible = ko.observable();

        this.currentMenuItem.subscribe(this.determineVisibleItem);

        this.determineVisibleItem();
    },
    template: require('../templates/listSelection.html')
});

