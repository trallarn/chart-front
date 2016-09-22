var $ = require('jquery');
var _ = require('underscore');
var ko = require('knockout');

ko.components.register('instrumentTable', {
    viewModel: function(params) {
        if(!params.list) {
            throw 'must supply list';
        }

        if(!params.onElementClick ) {
            throw 'must supply onElementClick ';
        }

        if(!params.onCompareClick) {
            throw 'must supply onCompareClick';
        }

        this.list = params.list;
        this.listType = params.listType;
        this.onElementClick = params.onElementClick;
        this.onCompareClick = params.onCompareClick;

    },
    template: require('../templates/instrumentTable.html')
});

