var $ = require('jquery');
var _ = require('underscore');
var ko = require('knockout');

ko.components.register('extremasSettings', {
    viewModel: function(params) {

        var self = this;

        self.extremeWildInput = ko.observable('100');
        self.extremeAgoInput = ko.observable('5 year');

        if(params.onLoad) {
            params.onLoad(this);
        }

    },

    template: require('../templates/extremasSettings.html')
});



