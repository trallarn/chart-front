var $ = require('jquery');
var _ = require('underscore');
var ko = require('knockout');

ko.components.register('listMenu', {
    viewModel: function(params) {

        if(!params.currentMenuItem) {
            throw 'Supply currentMenuItem';
        }

        var self = this;

        self.menuItems = [
            {
                display: 'Instruments',
                item: 'Instruments'
            },
            {
                display: 'WinnerLoser',
                item: 'WinnerLoser'
            }

        ];

        self.currentMenuItem = params.currentMenuItem;

        this.params = params;

        self.selectMenuItem = function(el) {
            console.log('on menu item click. Setting item ' + el.item);
            self.currentMenuItem(el.item);
        };

    },

    template: require('../templates/listMenu.html')
});


