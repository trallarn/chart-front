var $ = require('jquery');
var _ = require('underscore');
var ko = require('knockout');
var moment = require('moment');

/**
 * Optionally set the onChange-method in the onLoad-call.
 */
ko.components.register('extremasSettings', {
    viewModel: function(params) {

        var self = this;

        if(!params.onLoad){
            throw 'expected onLoad-method';
        }

        self.extremeWildInput = ko.observable('100');
        self.extremeAgoInput = ko.observable('5 year');

        self.internalOnChange = function() {
            if(self.onChange) {
                self.onChange(self.get());
            }
        };

        self.onChangeDebounced = _.debounce(self.internalOnChange , 500);

        self.get = function() {
            var agoParams = self.extremeAgoInput().split(' ');

            return {
                wild: self.extremeWildInput(),
                ago: self.extremeAgoInput(),
                from: moment().subtract(agoParams[0], agoParams[1])
            };
        };

        self.enabled = ko.observable(false);
        self.enabled.subscribe(self.internalOnChange);
        self.extremeWildInput.subscribe(self.onChangeDebounced);
        self.extremeAgoInput.subscribe(self.onChangeDebounced);

        if(params.onLoad) {
            params.onLoad(this);
        }

    },

    template: require('../templates/extremasSettings.html')
});



