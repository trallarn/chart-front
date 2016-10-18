var $ = require('jquery');
var _ = require('underscore');
var ko = require('knockout');

var stateRW = require('../infrastructure/StateRW');

ko.components.register('chartAndList', {
    viewModel: function(params) {
        var self = this;
        this.stateId = 'chartAndList';

        this.currentMenuItem = ko.observable();

        this.currentMenuItem.subscribe(function() {
            self.saveState();
        });

        self.saveState = function() {
            stateRW.save(self.stateId, {
                currentMenuItem: self.currentMenuItem()
            });
        };

        self.loadState = function() {
            var state = stateRW.read(self.stateId);
            
            if(state) {
                this.currentMenuItem(state.currentMenuItem);
            } else {
                this.currentMenuItem('Instruments');
            } 
        };

        self.loadState();
    },
    template: require('../templates/chartAndList.html')
});
