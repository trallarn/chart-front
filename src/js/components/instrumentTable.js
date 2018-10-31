var $ = require('jquery');
var _ = require('underscore');
var ko = require('knockout');

var InstrumentTableSpec = require('../vm/InstrumentTableSpec.js');

ko.components.register('instrumentTable', {
    viewModel: function(params) {
        if(!params.list) {
            throw 'must supply list';
        }

        var self = this;

        this.tableSpec = params.tableSpec || InstrumentTableSpec.defaultSpec();
        this.actions = params.actions || {};
        this.list = params.list;

        this.lastSortedColumn = false;

        this.sort = function(column) {
            if(self.lastSortedColumn && self.lastSortedColumn !== column) {
                self.lastSortedColumn.sorted = 0;
            }

            column.sorted = column.sorted === 1 ? -1 : 1;
            self.lastSortedColumn = column;
            self.list.sort(self.sortOn.bind(self, column, column.sorted));
        }

        this.sortOn = function(col, asc, el1, el2) {
            var val1 = col.prop ? el1[col.prop] : col.getVal(el1);
            var val2 = col.prop ? el2[col.prop] : col.getVal(el2);
            var val1Greater = val1 > val2 ? 1 : -1;

            return val1 === val2 ? 0
                : asc > 0 ? val1Greater : val1Greater * -1;
        };

        this.showSector = listElement => !!listElement.sector;
    },
    template: require('../templates/instrumentTable.html')
});

