/**
 * Specifications for InstrumentTable.
 */
module.exports = {

    baseColumns: function() {
        return [
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
    },

    defaultSpec: function() {

        let columns = this.baseColumns().concat([
            {
                name: 'Sector',
                prop: 'sector',
                sorted:0,
                order: 12
            }
        ]);
        addSort(columns);

        return {
            columns: columns,
            rowTemplate: 'rowTemplateDefault'
        };

    },

    indexSpec: function() {

        let columns = this.baseColumns();
        addSort(columns);

        return {
            columns: columns,
            rowTemplate: 'rowTemplateIndex'
        };

    },

    changeSpec: function() {
        var columns = this.defaultSpec().columns.concat([
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

        addSort(columns);

        return {
            columns: columns,
            rowTemplate: 'rowTemplateChange'
        };
    },

    errorSpec: function() {
        var columns = this.baseColumns().concat([
            {
                name: 'Error',
                getVal: function(row) { return row.extra.error; },
                sorted:0,
                order: 11
            }
        ]);

        addSort(columns);

        return {
            columns: columns,
            rowTemplate: 'rowTemplateDefault'
        };
    },
    
    favoriteSpec: function() {
        var columns = this.baseColumns();

        addSort(columns);

        return {
            columns: columns,
            rowTemplate: 'rowTemplateFavorite'
        };
    }
};

function addSort(columns) {
    columns.sort(function(el1, el2) {
        return el1.order === el2.order ? 0 : el1.order > el2.order ? 1 : -1;
    });
}

