var $ = require('jquery');
var _ = require('underscore');
var ko = require('knockout');

ko.components.register('listMenu', {
    viewModel: function(params) {

        var self = this;

        self.menuItems = [
            {
                display: 'Instruments',
                item: ''
            },
            {
                display: 'WinnersLosers',
                item: ''
            }

        ];

        this.params = params;

        self.selectMenuItem = function(el) {
            console.log('onclick ');
            console.dir(el);
        };

    },

    template: require('../templates/listMenu.html')
});


