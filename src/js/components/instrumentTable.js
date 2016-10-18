var $ = require('jquery');
var _ = require('underscore');
var ko = require('knockout');

ko.components.register('instrumentTable', {
    viewModel: function(params) {
        if(!params.list) {
            throw 'must supply list';
        }

        var self = this;

        this.setupColumns = function() {
            var columns = [
                {
                    name: '',
                    sorted:0,
                    order: 0
                },
                {
                    name: 'Name',
                    prop: 'name',
                    sorted:0,
                    order: 0
                },
                {
                    name: 'Symbol',
                    prop: 'symbol',
                    sorted:0,
                    order: 10
                },
                {
                    name: 'Actions',
                    prop: 'actions',
                    sorted:0,
                    order: 20
                }
            ];

            if(this.listType === 'change') {
                columns = columns.concat([
                    {
                        name: 'Change [%]',
                        getVal: function(row) { return row.extra.change.change; },
                        sorted:0,
                        order: 13
                    },
                    {
                        name: 'From',
                        getVal: function(row) { return row.extra.change.fromQuote.close; },
                        sorted:0,
                        order: 14
                    },
                    {
                        name: 'To',
                        getVal: function(row) { return row.extra.change.toQuote.close; },
                        sorted:0,
                        order: 15
                    }
                ]);

            } else if(this.listType === 'error') {
                columns = columns.concat([
                    {
                        name: 'Error',
                        getVal: function(row) { return row.extra.error; },
                        sorted:0,
                        order: 11
                    }
                ]);
            };


            columns.sort(function(el1, el2) {
                return el1.order === el2.order ? 0 : el1.order > el2.order;
            });

            return columns;

        };

        this.actions = params.actions || {};
        this.list = params.list;
        this.listType = params.listType;
        this.onElementClick = params.onElementClick;
        this.onCompareClick = params.onCompareClick;
        this.onAddToFavoriteClick = params.onAddToFavoriteClick ;
        this.onRemoveFromFavoriteClick = params.onRemoveFromFavoriteClick ;
        this.rowTemplate = this.listType === 'change' ? 'rowTemplateChange' 
            : this.listType === 'favorite' ? 'rowTemplateFavorite' : 'rowTemplateDefault';

        this.columns = this.setupColumns();
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

    },
    template: require('../templates/instrumentTable.html')
});

