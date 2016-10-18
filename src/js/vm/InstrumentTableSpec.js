/**
 * Specifications for InstrumentTable.
 */
module.exports = {

    defaultSpec: function() {
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

        addSort(columns);

        return {
            columns: columns,
            rowTemplate: 'rowTemplateDefault'
        };

    },

    changeSpec: function() {
        var defaultSpec = this.defaultSpec();

        var columns = defaultSpec.columns.concat([
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
        var defaultSpec = this.defaultSpec();

        var columns = defaultSpec.columns.concat([
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
        var defaultSpec = this.defaultSpec();

        var columns = defaultSpec.columns;

        addSort(columns);

        return {
            columns: columns,
            rowTemplate: 'rowTemplateFavorite'
        };
    }
};

function addSort(columns) {
    columns.sort(function(el1, el2) {
        return el1.order === el2.order ? 0 : el1.order > el2.order;
    });
}

