var $ = require('jquery');
var _ = require('underscore');
var ko = require('knockout');

ko.components.register('listSelection', {
    viewModel: function(params) {
        
        if(!params.currentMenuItem) {
            throw 'Supply chartAndList';
        }

        var self = this;

        this.determineVisibleItem = function() {
            self.isExtremasVisible(self.currentMenuItem() === 'Extremas');
            self.isWinnerLoserVisible(self.currentMenuItem() === 'WinnerLoser');
            self.isInstrumentsVisible(self.currentMenuItem() === 'Instruments');
        };

        this.chartAndList = params.chartAndList;
        this.currentMenuItem = params.currentMenuItem;

        this.isExtremasVisible = ko.observable();
        this.isWinnerLoserVisible = ko.observable();
        this.isInstrumentsVisible = ko.observable();

        this.currentMenuItem.subscribe(this.determineVisibleItem);

        this.determineVisibleItem();
    },
    template: require('../templates/listSelection.html')
});

